
// @ts-nocheck
// TODO: Remove ts-nocheck and fix types
"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useParams, usePathname } from 'next/navigation';
import { MOCK_MATTERS_DATA, MOCK_CONTACTS_DATA, MOCK_ASSETS_DATA, getContactNameById } from '@/lib/mock-data';
import type { Matter, Contact, Asset, AssetCategory as AssetCategoryEnum } from '@/lib/types';
import { AssetCategory } from '@/lib/types';
import { MatterActionRibbon } from '@/components/layout/matter-action-ribbon';


// --- Helper Functions ---
const formatCurrency = (value: any) => {
  if (typeof value !== 'number' || isNaN(value)) return '$0.00';
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
};

const parseAssetValue = (valueString: string): number => {
    if (!valueString) return 0;
    const cleanedValue = valueString.replace(/[^0-9.-]+/g,"");
    return parseFloat(cleanedValue) || 0;
};

const truncateText = (text: any, maxLength: any) => {
  if (typeof text !== 'string') return '';
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength - 3) + "...";
};

const STATE_ESTATE_TAX_INFO: Record<string, any> = {
  OR: { 
    name: "Oregon", 
    exemption: 1000000, 
    rate: 0.10, maxRate: 0.16, 
    brackets: [{ upto: 1000000, rate: 0}, { upto: 1500000, rate: 0.10 }, { upto: 2500000, rate: 0.1025 }, { upto: 3500000, rate: 0.105 }, { upto: 4500000, rate: 0.1075 }, { upto: 5500000, rate: 0.11 }, { upto: 6500000, rate: 0.1125 }, { upto: 7500000, rate: 0.115 }, { upto: 8500000, rate: 0.1175 }, { upto: 9500000, rate: 0.12 }, { upto: Infinity, rate: 0.16 }] 
  },
  WA: { 
    name: "Washington", 
    exemption: 2193000, 
    rate: 0.10, maxRate: 0.20, 
    brackets: [{upto: 2193000, rate: 0}, {upto: 3193000, rate: 0.10}, {upto: 4193000, rate: 0.14}, {upto: 6193000, rate: 0.15}, {upto: 8193000, rate: 0.18}, {upto: 11193000, rate: 0.19}, {upto: Infinity, rate: 0.20}],
    isCommunityProperty: true,
    communityPropertyNote: "Washington is a community property state. This can affect asset characterization and division at death. The trust funding shown is a simplified illustration."
  },
  CA: { 
    name: "California", 
    exemption: null, 
    rate: 0, description: "No state estate tax",
    isCommunityProperty: true,
    communityPropertyNote: "California is a community property state. This can affect asset characterization and division at death. The trust funding shown is a simplified illustration."
  },
  NY: { 
    name: "New York", 
    exemption: 6940000, 
    rate: 0.0306, maxRate: 0.16 
  },
  PA: {
    name: "Pennsylvania",
    exemption: null, 
    rate: 0, description: "No state estate tax",
    hasInheritanceTax: true,
    inheritanceTaxNote: "Pennsylvania has an inheritance tax (separate from estate tax) paid by beneficiaries. Rates vary based on relationship to the deceased (e.g., 0% for surviving spouses & charities, 4.5% for direct descendants, 12% for siblings, 15% for others). This visualizer does not calculate inheritance tax."
  },
  NJ: {
    name: "New Jersey",
    exemption: null, 
    rate: 0, description: "No state estate tax (phased out)",
    hasInheritanceTax: true,
    inheritanceTaxNote: "New Jersey has an inheritance tax paid by beneficiaries. Rates vary (0% for spouse, parent, child, grandchild; higher rates for other relatives and unrelated individuals). This visualizer does not calculate inheritance tax."
  },
  Federal: { 
    name: "Federal", 
    exemption: 13990000, 
    rate: 0.18, maxRate: 0.40, 
    gstExemption: 13990000 
  },
  NONE: { 
    name: "Select State", 
    exemption: null, 
    rate: 0, description: "Select a state to see tax info"
  }
};

const calculateTaxInternal = (taxableEstate: number, stateKey: string) => {
  if (taxableEstate <= 0) return 0;
  const taxConfig = STATE_ESTATE_TAX_INFO[stateKey];
  if (!taxConfig || taxConfig.exemption === null) return 0; 
  const amountOverExemption = taxableEstate - taxConfig.exemption;
  if (amountOverExemption <= 0) return 0;

  if (stateKey === 'OR' && taxConfig.brackets) {
    let tax = 0; let previousLimit = 0;
    for (const bracket of taxConfig.brackets) {
      if (taxableEstate > previousLimit) {
        const taxableInBracket = Math.min(taxableEstate, bracket.upto) - previousLimit;
        if (!(taxableInBracket <=0 && bracket.rate === 0 && bracket.upto >= taxConfig.exemption) && taxableInBracket > 0) {
             tax += taxableInBracket * bracket.rate;
        }
        if (taxableEstate <= bracket.upto) break;
        previousLimit = bracket.upto;
      } else break;
    }
    return tax;
  } else if (stateKey === 'WA' && taxConfig.brackets) { 
    let tax = 0; let previousLimit = 0;
    for (const bracket of taxConfig.brackets) {
        if (taxableEstate > previousLimit) {
            const taxableBracketValue = Math.min(taxableEstate, bracket.upto) - previousLimit;
            if (taxableBracketValue > 0) tax += taxableBracketValue * bracket.rate;
            if (taxableEstate <= bracket.upto) break;
            previousLimit = bracket.upto;
        } else break;
    }
    return tax;
  }
  return amountOverExemption * taxConfig.rate;
};

const areBeneficiariesEffectivelySame = (bens1: any[] = [], bens2: any[] = []) => {
    if (!bens1 || !bens2) return false;
    if (bens1.length === 0 && bens2.length === 0) return true;
    if (bens1.length !== bens2.length) return false;
    const sortedBens1 = [...bens1].sort((a, b) => (a.id || a.name).localeCompare(b.id || b.name));
    const sortedBens2 = [...bens2].sort((a, b) => (a.id || a.name).localeCompare(b.id || b.name));
    for (let i = 0; i < sortedBens1.length; i++) {
        const ben1 = sortedBens1[i];
        const ben2 = sortedBens2[i];
        if (((ben1.id && ben1.id !== ben2.id) || (!ben1.id && ben1.name !== ben2.name)) || ben1.sharePercent !== ben2.sharePercent) {
            return false;
        }
    }
    return true;
};

// --- Sub-Components ---
const TaxImplicationsSection = React.memo(({
    selectedState, onStateChange, taxInfo, estateValueAfterDebts, isMarriedCouplePlan,
    calculatedTax, taxAtSecondDeath_NoPlan, taxAtSecondDeath_WithPlan, estimatedTaxSavings,
    planName, showGstNote
}: any) => { 
    const federalGstExemption = STATE_ESTATE_TAX_INFO.Federal.gstExemption;
    return (
        <div className="mb-6 p-4 bg-card rounded-lg shadow print:shadow-none print:border print:border-border">
            <h2 className="text-xl font-semibold text-primary mb-3">Potential Estate Tax Implications</h2>
            <div className="grid md:grid-cols-2 gap-4 items-center mb-4 print:grid-cols-1">
                <div className="print:hidden"> 
                    <label htmlFor="stateSelect" className="block text-sm font-medium text-foreground mb-1">Select Jurisdiction for Tax Calculation:</label>
                    <select id="stateSelect" value={selectedState} onChange={onStateChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-input bg-background focus:outline-none focus:ring-ring focus:border-ring sm:text-sm rounded-md shadow-sm">
                        {Object.keys(STATE_ESTATE_TAX_INFO).map(key => (<option key={key} value={key}>{STATE_ESTATE_TAX_INFO[key].name}</option>))}
                    </select>
                </div>
                 <div className="print:block hidden text-sm text-muted-foreground"> 
                    Tax Jurisdiction: <span className="font-semibold">{taxInfo?.name || 'N/A'}</span>
                </div>
                {taxInfo && (
                    <div className="p-3 bg-primary/10 rounded-md print:bg-transparent print:p-0">
                        <p className="text-sm text-primary"><span className="font-semibold">{taxInfo.name} Exemption:</span> {taxInfo.exemption ? formatCurrency(taxInfo.exemption) : (taxInfo.description || 'N/A')}</p>
                        <p className="text-sm text-primary mt-1"><span className="font-semibold">Estate Value After Initial Debts/Expenses:</span> {formatCurrency(estateValueAfterDebts)}</p>
                        {!isMarriedCouplePlan && taxInfo.exemption !== null && (<p className="text-sm text-destructive mt-1"><span className="font-semibold">Estimated {taxInfo.name} Estate Tax (Individual Plan):</span> {formatCurrency(calculatedTax)}</p>)}
                    </div>
                )}
            </div>
            {isMarriedCouplePlan && taxInfo && taxInfo.exemption !== null && (
                <div className="mt-4 p-4 border border-primary/20 rounded-lg bg-primary/5 print:bg-transparent print:p-0 print:border-none">
                    <h3 className="text-lg font-semibold text-primary mb-2">{planName} Planning Tax Estimates ({taxInfo.name})</h3>
                    <div className="space-y-1 text-sm">
                        <p><strong>Est. Tax at Second Death (No {planName} Plan):</strong> <span className="text-destructive font-medium">{formatCurrency(taxAtSecondDeath_NoPlan)}</span></p>
                        <p className="text-xs text-muted-foreground"> (Assumes all assets pass to survivor, then taxed in survivor's estate using one exemption)</p>
                        <p><strong>Est. Tax at Second Death (With {planName} Plan):</strong> <span className="text-green-600 dark:text-green-500 font-medium">{formatCurrency(taxAtSecondDeath_WithPlan)}</span></p>
                        <p className="text-xs text-muted-foreground"> (Assumes Bypass/QTIP Trusts funded appropriately, utilizing exemptions &amp; marital deduction)</p>
                        <hr className="my-2 border-border"/>
                        <p className="text-base"><strong>Estimated {taxInfo.name} Tax Savings with {planName} Plan:</strong> <span className="text-green-600 dark:text-green-500 font-bold">{formatCurrency(estimatedTaxSavings)}</span></p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 print:hidden">Note: These are simplified estimates. Actual tax depends on many factors. Assumes $0 tax at first death with proper planning.</p>
                </div>
            )}
            {(selectedState === 'OR' || selectedState === 'NY' || selectedState === 'Federal' || selectedState === 'WA') && <p className="text-xs text-muted-foreground mt-1 print:hidden">State/Federal tax calculations are simplified and may not reflect full progressive rates or specific deductions.</p> }
            
            {taxInfo && taxInfo.hasInheritanceTax && (
                 <div className="mt-4 p-3 border border-accent/50 rounded-lg bg-accent/10 print:bg-transparent print:p-0 print:border-none">
                    <h4 className="text-md font-semibold text-accent-foreground/90 mb-1">{taxInfo.name} Inheritance Tax Note</h4>
                    <p className="text-xs text-accent-foreground/80">{taxInfo.inheritanceTaxNote}</p>
                </div>
            )}
            {taxInfo && taxInfo.isCommunityProperty && isMarriedCouplePlan && (
                 <div className="mt-4 p-3 border border-secondary rounded-lg bg-muted/50 print:bg-transparent print:p-0 print:border-none">
                    <h4 className="text-md font-semibold text-secondary-foreground mb-1">{taxInfo.name} Community Property Note</h4>
                    <p className="text-xs text-secondary-foreground/80">{taxInfo.communityPropertyNote}</p>
                </div>
            )}

            {showGstNote && (
                <div className="mt-4 p-3 border border-accent/50 rounded-lg bg-accent/10 print:bg-transparent print:p-0 print:border-none">
                    <h4 className="text-md font-semibold text-accent-foreground/90 mb-1">Generation-Skipping Transfer (GST) Tax Considerations</h4>
                    <p className="text-xs text-accent-foreground/80">
                        The GST tax is a federal tax on transfers to "skip persons" (e.g., grandchildren or more remote descendants, or unrelated individuals more than 37.5 years younger) that exceed the GST exemption.
                        The current Federal GST Exemption is approximately <span className="font-semibold">{formatCurrency(federalGstExemption)}</span> per individual (this amount is indexed for inflation and can change).
                    </p>
                    <p className="text-xs text-accent-foreground/80 mt-1 print:hidden">
                        This visualizer does <strong className="font-semibold">not</strong> calculate potential GST tax liability. It highlights trusts and beneficiaries where GST planning is relevant. Proper allocation of GST exemption is crucial to minimize or avoid this tax. Consult with a tax advisor for specific GST planning.
                    </p>
                </div>
            )}
        </div>
    );
});

const SvgDiagram = React.memo(({ 
    estateData, selectedTrust, selectedBeneficiary, selectedNonTrustAssets,
    onTrustClick, onBeneficiaryClick, onNonTrustAssetsClick,
    isMarriedCouplePlan, planSubType, setLastFocusedElement
}: any) => { 
    const svgRef = useRef<SVGSVGElement>(null);
    const initialSvgWidth = 800; 
    const [initialSvgHeight, setInitialSvgHeight] = useState(750);

    const [viewBox, setViewBox] = useState(`0 0 ${initialSvgWidth} ${initialSvgHeight}`);
    const [isPanning, setIsPanning] = useState(false);
    const [panStartPoint, setPanStartPoint] = useState({ x: 0, y: 0 });
    const [viewBoxAtPanStart, setViewBoxAtPanStart] = useState({ x: 0, y: 0, width: initialSvgWidth, height: initialSvgHeight });

    const grantorBoxHeight = 75; 
    const jointTrustBoxWidth = 250;
    const jointTrustBoxHeight = 130;
    const trustBoxWidth = planSubType === 'ABC' ? 190 : 220; 
    const trustBoxHeight = 120; 
    const beneficiaryBoxWidth = 160; 
    const beneficiaryBoxHeight = 70; 
    const nonTrustAssetBoxWidth = 180;
    const nonTrustAssetBoxHeight = 70;
    const spacingY = 100; 
    const startY = 40;
    const currentGrantorBoxWidth = 220 * (isMarriedCouplePlan ? 1.5 : 1.2);
    const startXGrantor = initialSvgWidth / 2 - currentGrantorBoxWidth / 2;

    const svgDrawingContent = useMemo(() => {
        if (!estateData || !estateData.mainRevocableTrust || !estateData.subTrusts) {
             return { content: [<text key="no-data-svg" x="10" y="20" fill="hsl(var(--muted-foreground))">SVG Diagram: Insufficient data.</text>], height: 100 };
        }
        const elements = [];
        const { grantor1Name, grantor2Name, totalOverallValue, nonTrustAssets, mainRevocableTrust, subTrusts } = estateData;
        
        const grantorTextLine1 = isMarriedCouplePlan ? truncateText(`${grantor1Name || 'Grantor 1'} & ${grantor2Name || 'Grantor 2'}`, 35) : truncateText(`${grantor1Name || 'N/A'}`, 30);
        const grantorTextLine2 = "Total Estate";

        // Grantor/Estate Box
        elements.push(
          <g key="grantor-estate" transform={`translate(${startXGrantor}, ${startY})`}>
            <title>{`${grantorTextLine1} - Total Value: ${formatCurrency(totalOverallValue)}`}</title>
            <rect width={currentGrantorBoxWidth} height={grantorBoxHeight} fill="hsl(210, 20%, 92%)" stroke="hsl(210, 15%, 60%)" strokeWidth="2" rx="8" ry="8" />
            <text x={currentGrantorBoxWidth / 2} y={20} textAnchor="middle" fontWeight="bold" fontSize="14px" fill="hsl(210, 20%, 25%)">{grantorTextLine1}</text>
            <text x={currentGrantorBoxWidth / 2} y={38} textAnchor="middle" fontWeight="bold" fontSize="13px" fill="hsl(210, 20%, 25%)">{grantorTextLine2}</text>
            <text x={currentGrantorBoxWidth / 2} y={56} textAnchor="middle" fontSize="12px" fill="hsl(210, 20%, 25%)">{formatCurrency(totalOverallValue)}</text>
          </g>
        );
        
        // Non-Trust Assets Box
        const nonTrustAssetsTotalValue = nonTrustAssets.reduce((sum: number, asset: any) => sum + asset.value, 0);
        const nonTrustAssetBoxX = startXGrantor - nonTrustAssetBoxWidth - 30; 
        const nonTrustAssetBoxY = startY + (grantorBoxHeight - nonTrustAssetBoxHeight) / 2;
        const isNonTrustSelected = selectedNonTrustAssets && nonTrustAssets && selectedNonTrustAssets.length === nonTrustAssets.length;

        if (nonTrustAssets && nonTrustAssets.length > 0) {
            elements.push(
                <g key="non-trust-assets" transform={`translate(${nonTrustAssetBoxX}, ${nonTrustAssetBoxY})`} onClick={onNonTrustAssetsClick} style={{cursor: 'pointer'}} tabIndex={0} role="button" aria-label={`Non-Trust Assets, Value: ${formatCurrency(nonTrustAssetsTotalValue)}`} >
                    <title>{`Non-Trust Assets - Value: ${formatCurrency(nonTrustAssetsTotalValue)}\nPass by Beneficiary Designation`}</title>
                    <rect width={nonTrustAssetBoxWidth} height={nonTrustAssetBoxHeight} fill="hsl(210, 20%, 98%)" stroke="hsl(210, 15%, 85%)" strokeWidth={isNonTrustSelected ? 3 : 2} strokeDasharray={isNonTrustSelected ? "none" : "4 2"} rx="8" ry="8" />
                    <text x={nonTrustAssetBoxWidth / 2} y={nonTrustAssetBoxHeight / 2 - 8} textAnchor="middle" fontWeight="bold" fontSize="12px" fill="hsl(210, 15%, 45%)">Non-Trust Assets</text>
                    <text x={nonTrustAssetBoxWidth / 2} y={nonTrustAssetBoxHeight / 2 + 12} textAnchor="middle" fontSize="11px" fill="hsl(210, 15%, 45%)">{formatCurrency(nonTrustAssetsTotalValue)}</text>
                    <text x={nonTrustAssetBoxWidth / 2} y={nonTrustAssetBoxHeight / 2 + 28} textAnchor="middle" fontStyle="italic" fontSize="9px" fill="hsl(210, 15%, 45%)">(Pass by Beneficiary)</text>
                </g>
            );
             elements.push( <line key="line-estate-to-nontrust" x1={startXGrantor} y1={startY + grantorBoxHeight/2} x2={nonTrustAssetBoxX + nonTrustAssetBoxWidth} y2={nonTrustAssetBoxY + nonTrustAssetBoxHeight/2} stroke="hsl(var(--border))" strokeWidth="2" strokeDasharray="4 2" markerEnd="url(#arrow)" /> );
        }

        // Main Revocable Trust Box
        const jointTrustY = startY + grantorBoxHeight + spacingY - (nonTrustAssets?.length > 0 ? 20 : 30); 
        const jointTrustX = initialSvgWidth / 2 - jointTrustBoxWidth / 2;
        
        elements.push(
            <line key="line-estate-to-joint" x1={startXGrantor + currentGrantorBoxWidth / 2} y1={startY + grantorBoxHeight} x2={jointTrustX + jointTrustBoxWidth / 2} y2={jointTrustY} stroke="hsl(var(--border))" strokeWidth="2" markerEnd="url(#arrow)" />
        );

        elements.push(
            <g key="joint-trust" transform={`translate(${jointTrustX}, ${jointTrustY})`} onClick={() => onTrustClick(mainRevocableTrust)} style={{cursor: 'pointer'}} tabIndex={0} role="button" aria-label={`Joint Trust: ${mainRevocableTrust.name}, Value: ${formatCurrency(mainRevocableTrust.value)}`}>
                <title>{`${mainRevocableTrust.name} - Value: ${formatCurrency(mainRevocableTrust.value)}\nTrustees: ${mainRevocableTrust.trustees.join(', ')}\nSuccessors: ${mainRevocableTrust.successorTrustees}`}</title>
                <rect width={jointTrustBoxWidth} height={jointTrustBoxHeight} fill="hsl(180, 100%, 25%)" stroke="hsl(180, 100%, 20%)" strokeWidth={selectedTrust?.id === mainRevocableTrust.id ? 3: 2} rx="8" ry="8" />
                <text x={jointTrustBoxWidth / 2} y={20} textAnchor="middle" fontWeight="bold" fontSize="13px" fill="hsl(180, 100%, 95%)">{truncateText(mainRevocableTrust.name, 35)}</text>
                <text x={jointTrustBoxWidth / 2} y={38} textAnchor="middle" fontSize="12px" fill="hsl(180, 100%, 95%)">{formatCurrency(mainRevocableTrust.value)}</text>
                <text x={jointTrustBoxWidth / 2} y={54} textAnchor="middle" fontSize="10px" fill="hsl(180, 100%, 95%)">Trustee(s): {truncateText(mainRevocableTrust.trustees.join(', '), 30)}</text>
                <text x={jointTrustBoxWidth / 2} y={68} textAnchor="middle" fontSize="10px" fill="hsl(180, 100%, 95%)">Successors: {truncateText(mainRevocableTrust.successorTrustees.join(', ') || "As per document", 30)}</text>
                {mainRevocableTrust.fundedAssets && mainRevocableTrust.fundedAssets.length > 0 && (
                    <>
                        <text x={10} y={86} fontSize="9px" fill="hsl(180, 100%, 95%)" fontWeight="bold">Funded Assets:</text>
                        {mainRevocableTrust.fundedAssets.slice(0,2).map((asset: any, idx: number) => (
                             <text key={`funded-${idx}`} x={15} y={96 + idx * 10} fontSize="9px" fill="hsl(180, 100%, 95%)">
                                - {truncateText(asset.name, 30)} ({asset.status})
                            </text>
                        ))}
                        {mainRevocableTrust.fundedAssets.length > 2 && <text x={15} y={96 + 2 * 10} fontSize="9px" fill="hsl(180, 100%, 95%)" fontStyle="italic">...and {mainRevocableTrust.fundedAssets.length - 2} more</text>}
                    </>
                )}
            </g>
        );

        // Sub-Trusts (A, B, C)
        let subTrustsCurrentY = jointTrustY + jointTrustBoxHeight + spacingY;
        const trustPositions: Record<string, any> = {};
        const numSubTrusts = subTrusts.length;
        const subTrustSpacingX = planSubType === 'ABC' ? 25 : 40; 
        const totalSubTrustsWidth = numSubTrusts * trustBoxWidth + (numSubTrusts > 0 ? (numSubTrusts - 1) * subTrustSpacingX : 0);
        const subTrustsStartX = initialSvgWidth / 2 - totalSubTrustsWidth / 2;
        const subTrustLineElements = [];

        subTrusts.forEach((trust: any, index: number) => {
          if (!trust || typeof trust !== 'object') return;
          trust.beneficiaries = Array.isArray(trust.beneficiaries) ? trust.beneficiaries : [];
          const trustX = subTrustsStartX + index * (trustBoxWidth + subTrustSpacingX);
          const trustY = subTrustsCurrentY;
          trustPositions[trust.id] = { x: trustX + trustBoxWidth / 2, y: trustY + trustBoxHeight, topY: trustY, centerX: trustX + trustBoxWidth / 2, rawX: trustX };
          const isTrustSelectedAsSource = selectedTrust && selectedTrust.id === trust.id;
          subTrustLineElements.push( <line key={`line-joint-to-${trust.id}`} x1={jointTrustX + jointTrustBoxWidth / 2} y1={jointTrustY + jointTrustBoxHeight} x2={trustX + trustBoxWidth / 2} y2={trustY} stroke={isTrustSelectedAsSource ? "hsl(180, 100%, 25%)" : "hsl(var(--border))"}  strokeWidth={isTrustSelectedAsSource ? "3" : "2"} markerEnd={isTrustSelectedAsSource ? "url(#arrowHighlighted)" : "url(#arrow)"} style={{transition: "stroke 0.3s, stroke-width 0.3s"}} /> );
        });
        elements.push(...subTrustLineElements);

        subTrusts.forEach((trust: any, index: number) => {
            const trustX = subTrustsStartX + index * (trustBoxWidth + subTrustSpacingX);
            const trustY = subTrustsCurrentY;
            const isTrustSelected = selectedTrust && selectedTrust.id === trust.id;
            
            let baseFill, baseStroke, titleTextColor, detailTextColor;

            switch (trust.id) {
                case 'trustA': // Survivor's Trust
                    baseFill = "hsl(200, 80%, 88%)"; // Light Sky Blue
                    baseStroke = "hsl(200, 70%, 65%)"; // Medium Sky Blue
                    titleTextColor = "hsl(200, 70%, 30%)"; // Dark Blue
                    detailTextColor = "hsl(200, 60%, 45%)"; // Medium Blue
                    break;
                case 'trustB': // Bypass Trust
                    baseFill = "hsl(50, 100%, 88%)"; // Light Gold/Yellow
                    baseStroke = "hsl(50, 80%, 60%)"; // Medium Gold/Yellow
                    titleTextColor = "hsl(35, 70%, 30%)"; // Dark Brown/Orange
                    detailTextColor = "hsl(35, 60%, 40%)"; // Brown/Orange
                    break;
                case 'trustC': // QTIP Trust
                    baseFill = "hsl(270, 60%, 90%)"; // Light Purple/Lavender
                    baseStroke = "hsl(270, 50%, 60%)"; // Medium Purple
                    titleTextColor = "hsl(270, 50%, 30%)"; // Dark Purple
                    detailTextColor = "hsl(270, 40%, 40%)"; // Medium Purple
                    break;
                default: // Default styling
                    baseFill = "hsl(var(--primary))"; 
                    baseStroke = "hsl(var(--primary))";
                    titleTextColor = "hsl(var(--primary-foreground))"; 
                    detailTextColor = "hsl(var(--primary-foreground))";
            }

            const actualStroke = isTrustSelected ? baseStroke : baseStroke; // Can make selected stroke thicker or different if needed
            const actualFill = baseFill;

            const trustTitleY = 18;
            const trustValueY = trustTitleY + 18; 
            const trusteeTextY = trustValueY + 15; 
            const assetsLabelY = trusteeTextY + 15; 
            const assetItemYStart = assetsLabelY + 12; 
            const assetItemLineHeight = 11;

            const truncatedTrustName = truncateText(trust.name || 'Unnamed Sub-Trust', planSubType === 'ABC' ? 22 : 28);
            const truncatedTrustees = truncateText(trust.trustees?.join(', ') || 'N/A', 18);
            
            const trustAriaLabel = `Sub-Trust: ${trust.name || 'Unnamed Sub-Trust'}, Value: ${formatCurrency(trust.value)}`;
            elements.push(
                <g 
                    key={trust.id || `sub-trust-${index}`} 
                    transform={`translate(${trustX}, ${trustY})`} 
                    onClick={(e) => { setLastFocusedElement(e.currentTarget); onTrustClick(trust); }} 
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { setLastFocusedElement(e.currentTarget); onTrustClick(trust);}}}
                    style={{ cursor: 'pointer' }}
                    tabIndex={0}
                    role="button"
                    aria-label={trustAriaLabel}
                    aria-pressed={isTrustSelected}
                >
                <title>{`${trust.name} - Value: ${formatCurrency(trust.value)}\nTrustees: ${trust.trustees?.join(', ')}\nAssets: ${trust.allocatedAssetNames?.slice(0,3).join(', ') + (trust.allocatedAssetNames?.length > 3 ? '...' : '')}`}</title>
                <rect width={trustBoxWidth} height={trustBoxHeight} fill={actualFill} stroke={actualStroke} strokeWidth={isTrustSelected ? "3" : "2"} rx="8" ry="8" />
                <text x={trustBoxWidth / 2} y={trustTitleY} textAnchor="middle" fontWeight="bold" fontSize="13px" fill={titleTextColor}>{truncatedTrustName}</text>
                <text x={trustBoxWidth / 2} y={trustValueY} textAnchor="middle" fontSize="12px" fill={detailTextColor}>{formatCurrency(trust.value)}</text>
                <text x={trustBoxWidth / 2} y={trusteeTextY} textAnchor="middle" fontSize="10px" fill={detailTextColor}>Trustee(s): {truncatedTrustees}</text>
                {trust.allocatedAssetNames && trust.allocatedAssetNames.length > 0 && ( 
                    <> 
                        <text x={10} y={assetsLabelY} fontSize="9px" fill={detailTextColor} fontWeight="bold">Assets:</text> 
                        {trust.allocatedAssetNames.slice(0, 2).map((assetName: string, assetIdx: number) => ( 
                            <text key={assetIdx} x={15} y={assetItemYStart + assetIdx * assetItemLineHeight} fontSize="9px" fill={detailTextColor}>- {truncateText(assetName, planSubType === 'ABC' ? 20 : 25)}</text>
                        ))} 
                        {trust.allocatedAssetNames.length > 2 && (<text x={15} y={assetItemYStart + 2 * assetItemLineHeight} fontSize="9px" fill={detailTextColor} fontStyle="italic">...and {trust.allocatedAssetNames.length - 2} more</text>)} 
                    </> 
                )}
                </g>
            );
        });
        
        // Beneficiary Boxes
        let maxBeneficiaryYLevel = subTrustsCurrentY + trustBoxHeight;
        const trustA = subTrusts.find((t: any) => t.id === 'trustA');
        const trustB = subTrusts.find((t: any) => t.id === 'trustB');
        const trustC = subTrusts.find((t: any) => t.id === 'trustC');
        const beneficiariesCombinedAB = planSubType === 'AB' && trustA && trustB && areBeneficiariesEffectivelySame(trustA.beneficiaries, trustB.beneficiaries);
        const beneficiariesCombinedBC = planSubType === 'ABC' && trustB && trustC && areBeneficiariesEffectivelySame(trustB.beneficiaries, trustC.beneficiaries);
        const beneficiaryStartYCommon = subTrustsCurrentY + trustBoxHeight + spacingY / 1.5;
        const beneficiarySpacingX = 20;
        const beneficiaryLineElements = [];

        const drawBeneficiaryGroup = (beneficiaries: any[], groupStartX: number, groupStartY: number, primaryTrustIdForDetails: string, isCombinedViewType: any = null, connectingTrustsData: any[] = []) => {
            maxBeneficiaryYLevel = Math.max(maxBeneficiaryYLevel, groupStartY + beneficiaryBoxHeight);
            const totalBeneficiaryWidth = beneficiaries.length * beneficiaryBoxWidth + (beneficiaries.length > 0 ? (beneficiaries.length - 1) * beneficiarySpacingX : 0);
            const actualStartX = groupStartX - totalBeneficiaryWidth / 2; 
            beneficiaries.forEach((ben, benIndex) => {
                const benX = actualStartX + benIndex * (beneficiaryBoxWidth + beneficiarySpacingX);
                const benY = groupStartY;
                const isBenSelected = selectedBeneficiary && selectedBeneficiary.id === ben.id && (selectedBeneficiary.isCombinedViewType === isCombinedViewType || (!isCombinedViewType && selectedBeneficiary.trustId === primaryTrustIdForDetails));
                const benTitleY = beneficiaryBoxHeight / 2 - 8;
                const benShareY = beneficiaryBoxHeight / 2 + 12;
                const benAriaLabel = `Beneficiary: ${ben.name || 'Unnamed'}, Share: ${ben.sharePercent ? `${ben.sharePercent}%` : formatCurrency(ben.amount || 0)}`;
                elements.push( 
                    <g 
                        key={`${isCombinedViewType || primaryTrustIdForDetails}-ben-${ben.id || benIndex}`} 
                        transform={`translate(${benX}, ${benY})`} 
                        onClick={(e) => { setLastFocusedElement(e.currentTarget); e.stopPropagation(); onBeneficiaryClick(ben, primaryTrustIdForDetails, isCombinedViewType);}} 
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { setLastFocusedElement(e.currentTarget); e.stopPropagation(); onBeneficiaryClick(ben, primaryTrustIdForDetails, isCombinedViewType);}}}
                        style={{ cursor: 'pointer' }}
                        tabIndex={0}
                        role="button"
                        aria-label={benAriaLabel}
                        aria-pressed={isBenSelected}
                    > 
                        <title>{`${ben.name} - Share: ${ben.sharePercent ? `${ben.sharePercent}%` : formatCurrency(ben.amount || 0)}`}</title> 
                        <rect width={beneficiaryBoxWidth} height={beneficiaryBoxHeight} fill={isBenSelected ? "hsla(120, 60%, 80%, 1)" : "hsla(120, 60%, 90%, 1)"} stroke={isBenSelected ? "hsl(120, 50%, 45%)" : "hsl(120, 50%, 55%)"} strokeWidth={isBenSelected ? "3" : "2"} rx="8" ry="8" /> 
                        <text x={beneficiaryBoxWidth/2} y={benTitleY} textAnchor="middle" fontSize="12px" fontWeight="bold" fill="hsl(120, 50%, 25%)">{truncateText(ben.name || 'Unnamed', 24)}</text> 
                        <text x={beneficiaryBoxWidth/2} y={benShareY} textAnchor="middle" fontSize="11px" fill="hsl(120, 50%, 25%)">{ben.sharePercent ? `${ben.sharePercent}%` : formatCurrency(ben.amount || 0)}</text> 
                    </g> 
                );
                connectingTrustsData.forEach(connTrust => {  if (trustPositions[connTrust.id]) { const lineToBenHighlighted = isBenSelected || (selectedTrust && selectedTrust.id === connTrust.id); beneficiaryLineElements.push( <line key={`line-${connTrust.id}-to-${isCombinedViewType || primaryTrustIdForDetails}-ben-${ben.id}`} x1={trustPositions[connTrust.id].x} y1={trustPositions[connTrust.id].y}  x2={benX + beneficiaryBoxWidth / 2} y2={benY} stroke={lineToBenHighlighted ? "hsl(180, 100%, 25%)" : "hsl(var(--border))"} strokeWidth={lineToBenHighlighted ? "3" : "2"} markerEnd={lineToBenHighlighted ? "url(#arrowHighlighted)" : "url(#arrow)"} style={{transition: "stroke 0.3s, stroke-width 0.3s"}}/>); } });
            });
        };

        if (beneficiariesCombinedAB) { drawBeneficiaryGroup(trustA.beneficiaries, initialSvgWidth / 2, beneficiaryStartYCommon, 'trustA', 'AB', [trustA, trustB]); } 
        else if (beneficiariesCombinedBC) {
            const combinedBCBenStartX = (trustPositions.trustB.centerX + trustPositions.trustC.centerX) / 2;
            drawBeneficiaryGroup(trustB.beneficiaries, combinedBCBenStartX, beneficiaryStartYCommon, 'trustB', 'BC', [trustB, trustC]);
            if (trustA && trustA.beneficiaries.length > 0) { drawBeneficiaryGroup(trustA.beneficiaries, trustPositions.trustA.centerX, beneficiaryStartYCommon, 'trustA', null, [trustA]); }
        } else { subTrusts.forEach((trust: any) => { if (trustPositions[trust.id] && trust.beneficiaries.length > 0) { drawBeneficiaryGroup(trust.beneficiaries, trustPositions[trust.id].centerX, beneficiaryStartYCommon, trust.id, null, [trust]); } }); }
        elements.push(...beneficiaryLineElements); 
        
        const calculatedHeight = Math.max(maxBeneficiaryYLevel + spacingY, 750); 
        return { content: elements, height: calculatedHeight };
    }, [
        estateData, selectedTrust, selectedBeneficiary, selectedNonTrustAssets,
        onTrustClick, onBeneficiaryClick, onNonTrustAssetsClick, setLastFocusedElement,
        isMarriedCouplePlan, planSubType,
        initialSvgWidth, startXGrantor, currentGrantorBoxWidth, grantorBoxHeight, 
        jointTrustBoxWidth, jointTrustBoxHeight, nonTrustAssetBoxWidth, nonTrustAssetBoxHeight,
        trustBoxWidth, trustBoxHeight, beneficiaryBoxWidth, beneficiaryBoxHeight, 
        spacingY, startY
    ]); 

    useEffect(() => {
        if (svgDrawingContent.height && svgDrawingContent.height !== initialSvgHeight) {
            setInitialSvgHeight(svgDrawingContent.height);
            setViewBox(`0 0 ${initialSvgWidth} ${svgDrawingContent.height}`); 
        }
    }, [svgDrawingContent.height, initialSvgWidth, initialSvgHeight]);

    const handleWheel = useCallback((event: React.WheelEvent<HTMLDivElement>) => {
        event.preventDefault();
        if (!svgRef.current) return;
        const [vx, vy, vw, vh] = viewBox.split(" ").map(parseFloat);
        const zoomFactor = event.deltaY < 0 ? 1.1 : 0.9; 
        const svgRect = svgRef.current.getBoundingClientRect();
        const mouseX = event.clientX - svgRect.left;
        const mouseY = event.clientY - svgRect.top;
        const svgPointX = vx + (mouseX / svgRect.width) * vw;
        const svgPointY = vy + (mouseY / svgRect.height) * vh;
        const newWidth = vw / zoomFactor;
        const newHeight = vh / zoomFactor;
        const newX = svgPointX - (mouseX / svgRect.width) * newWidth;
        const newY = svgPointY - (mouseY / svgRect.height) * newHeight;
        setViewBox(`${newX} ${newY} ${newWidth} ${newHeight}`);
    }, [viewBox]);

    const handleMouseDown = useCallback((event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
        const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;
        if ('button' in event && event.button !== 0) return; 
        setIsPanning(true);
        setPanStartPoint({ x: clientX, y: clientY });
        const [vx, vy, vw, vh] = viewBox.split(" ").map(parseFloat);
        setViewBoxAtPanStart({ x: vx, y: vy, width: vw, height: vh });
    }, [viewBox]);

    const handleMouseMove = useCallback((event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        if (!isPanning || !svgRef.current) return;
        const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
        const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;
        const dxScreen = clientX - panStartPoint.x;
        const dyScreen = clientY - panStartPoint.y;
        const svgRect = svgRef.current.getBoundingClientRect();
        const scaleX = viewBoxAtPanStart.width / svgRect.width;
        const scaleY = viewBoxAtPanStart.height / svgRect.height;
        const dxSVG = dxScreen * scaleX;
        const dySVG = dyScreen * scaleY;
        setViewBox(`${viewBoxAtPanStart.x - dxSVG} ${viewBoxAtPanStart.y - dySVG} ${viewBoxAtPanStart.width} ${viewBoxAtPanStart.height}`);
    }, [isPanning, panStartPoint, viewBoxAtPanStart]);

    const handleMouseUpOrLeave = useCallback(() => {
        setIsPanning(false);
    }, []);

    const handleZoomControls = (factor: number) => {
        const [vx, vy, vw, vh] = viewBox.split(" ").map(parseFloat);
        const newWidth = vw / factor;
        const newHeight = vh / factor;
        const centerX = vx + vw / 2;
        const centerY = vy + vh / 2;
        const newX = centerX - newWidth / 2;
        const newY = centerY - newHeight / 2;
        setViewBox(`${newX} ${newY} ${newWidth} ${newHeight}`);
    };
    
    const resetZoomPan = () => {
        setViewBox(`0 0 ${initialSvgWidth} ${initialSvgHeight}`);
    };


    return (
        <div className="relative">
            <div 
                className="overflow-hidden cursor-grab" 
                style={{ touchAction: 'none' }} 
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUpOrLeave}
                onMouseLeave={handleMouseUpOrLeave}
                onTouchStart={handleMouseDown}
                onTouchMove={handleMouseMove}
                onTouchEnd={handleMouseUpOrLeave}
                onWheel={handleWheel}
                ref={svgRef}
            >
                <svg width="100%" height={initialSvgHeight} 
                     viewBox={viewBox} 
                     preserveAspectRatio="xMidYMid meet" 
                     className="min-w-[700px]"
                     aria-labelledby="diagramTitle" 
                     role="graphics-document" 
                >
                    <defs>
                        <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="hsl(var(--border))" /></marker>
                        <marker id="arrowHighlighted" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="hsl(var(--primary))" /></marker>
                    </defs>
                    {svgDrawingContent.content}
                </svg>
            </div>
            <div className="absolute top-2 right-2 flex flex-col space-y-1 z-10 print:hidden">
                <button onClick={() => handleZoomControls(1.2)} className="p-1.5 bg-secondary text-secondary-foreground rounded shadow hover:bg-secondary/80 text-xs" aria-label="Zoom In Diagram">Zoom In (+)</button>
                <button onClick={() => handleZoomControls(0.8)} className="p-1.5 bg-secondary text-secondary-foreground rounded shadow hover:bg-secondary/80 text-xs" aria-label="Zoom Out Diagram">Zoom Out (-)</button>
                <button onClick={resetZoomPan} className="p-1.5 bg-secondary text-secondary-foreground rounded shadow hover:bg-secondary/80 text-xs" aria-label="Reset Diagram View">Reset View</button>
            </div>
        </div>
    );
});

const TrustDetailsPanel = React.memo(({ selectedTrust, onClose, lastFocusedElementRef }: any) => { 
    const closeButtonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (selectedTrust && closeButtonRef.current) {
            closeButtonRef.current.focus();
        }
    }, [selectedTrust]);
    
    const handleClose = () => {
        onClose();
        if (lastFocusedElementRef && lastFocusedElementRef.current) {
            lastFocusedElementRef.current.focus();
        }
    };

    if (!selectedTrust) return null;
    return ( 
        <div className="mt-8 p-6 bg-primary/5 border border-primary/20 rounded-lg shadow-md print:hidden" role="dialog" aria-labelledby="trustDetailsHeading">
            <div className="flex justify-between items-center mb-4">
                <h3 id="trustDetailsHeading" className="text-2xl font-semibold text-primary">Trust Details: {selectedTrust.name}</h3>
                <button ref={closeButtonRef} onClick={handleClose} className="text-sm text-primary hover:text-primary/80 font-medium" aria-label={`Close Trust Details for ${selectedTrust.name}`}>Close X</button>
            </div>
            <div className="space-y-3 text-sm text-foreground">
                {selectedTrust.isIrrevocable && (
                    <div className="p-3 bg-accent/10 border border-accent/30 rounded-md mb-3">
                        <h4 className="text-md font-semibold text-accent-foreground/90 mb-1">Irrevocable Trust</h4>
                        <p className="text-xs text-accent-foreground/80">This trust is generally irrevocable, meaning its terms cannot be easily changed once established.</p>
                        {selectedTrust.irrevocableFeatures && selectedTrust.irrevocableFeatures.length > 0 && (
                            <>
                                <p className="text-xs text-accent-foreground/80 mt-1">Key characteristics may include:</p>
                                <ul className="list-disc list-inside pl-4 mt-1 text-xs text-accent-foreground/80">
                                    {selectedTrust.irrevocableFeatures.map((feature: string, i: number) => <li key={i}>{feature}</li>)}
                                </ul>
                            </>
                        )}
                    </div>
                )}
                <p><strong>Trust Purpose:</strong> {selectedTrust.trustPurpose || 'N/A'}</p>
                {selectedTrust.id === 'trustC' && <p className="text-accent-foreground font-medium">This is a QTIP (Marital) Trust. Surviving spouse receives all income. Principal included in survivor's estate.</p>}
                <p><strong>Current Trustees:</strong> {selectedTrust.trustees && selectedTrust.trustees.length > 0 ? selectedTrust.trustees.join(', ') : 'N/A'}</p>
                <p><strong>Successor Trustees:</strong> {selectedTrust.successorTrustees && selectedTrust.successorTrustees.length > 0 ? selectedTrust.successorTrustees.join(', ') : 'N/A'}</p>
                <div><strong>Key Provisions:</strong> {selectedTrust.keyProvisions && selectedTrust.keyProvisions.length > 0 ? ( <ul className="list-disc list-inside pl-4 mt-1 space-y-1">{selectedTrust.keyProvisions.map((p: string, i: number) => <li key={i}>{p}</li>)}</ul> ) : ' N/A'} </div>
                {selectedTrust.allocatedAssetNames && selectedTrust.allocatedAssetNames.length > 0 && ( <div><strong>Allocated Assets:</strong> <ul className="list-disc list-inside pl-4 mt-1 space-y-1"> {selectedTrust.allocatedAssetNames.map((asset: string, i: number) => <li key={i}>{asset}</li>)} </ul> </div> )}
                {selectedTrust.fundedAssets && selectedTrust.fundedAssets.length > 0 && ( <div><strong>Funded Assets (in Main Trust):</strong> <ul className="list-disc list-inside pl-4 mt-1 space-y-1"> {selectedTrust.fundedAssets.map((asset: any, i: number) => <li key={i}>{asset.name} ({asset.status})</li>)} </ul> </div> )}
                {selectedTrust.gstExemptionAllocated && <p><strong>GST Exemption Allocated:</strong> {selectedTrust.gstExemptionAllocated} {selectedTrust.gstExemptionAllocated === "Full (deceased spouse's)" && <span className="text-xs text-muted-foreground">(Intends to use deceased spouse's GST exemption to make trust fully exempt for skip persons)</span>} {selectedTrust.gstExemptionAllocated === "Reverse QTIP Election (possible)" && <span className="text-xs text-muted-foreground">(May allow deceased spouse's GST exemption to be used for QTIP assets)</span>} </p>}
                {selectedTrust.gstNotes && <p><strong>GST Notes:</strong> {selectedTrust.gstNotes}</p>}
                <p><strong>Termination Conditions:</strong> {selectedTrust.terminationConditions || 'N/A'}</p>
                {selectedTrust.notes && <p><strong>Additional Notes:</strong> {selectedTrust.notes}</p>}
            </div>
        </div>
    );
});

const BeneficiaryDetailsPanel = React.memo(({ selectedBeneficiary, onClose, lastFocusedElementRef }: any) => { 
    const closeButtonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (selectedBeneficiary && closeButtonRef.current) {
            closeButtonRef.current.focus();
        }
    }, [selectedBeneficiary]);
    
    const handleClose = () => {
        onClose();
        if (lastFocusedElementRef && lastFocusedElementRef.current) {
            lastFocusedElementRef.current.focus();
        }
    };

    if (!selectedBeneficiary || !selectedBeneficiary.distributionDetails) return null;
    return ( <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg shadow-md print:hidden" role="dialog" aria-labelledby="beneficiaryDetailsHeading"> <div className="flex justify-between items-center mb-4"> <h3 id="beneficiaryDetailsHeading" className="text-2xl font-semibold text-green-700">Beneficiary Details: {selectedBeneficiary.name} {selectedBeneficiary.trustName && <span className="text-lg text-green-600"> (from {selectedBeneficiary.trustName})</span>} </h3> <button ref={closeButtonRef} onClick={handleClose} className="text-sm text-green-600 hover:text-green-800 font-medium" aria-label={`Close Beneficiary Details for ${selectedBeneficiary.name}`}>Close X</button> </div> <div className="space-y-3 text-sm text-foreground"> <p><strong>Distribution Type:</strong> {selectedBeneficiary.distributionDetails.type || 'N/A'}</p> {selectedBeneficiary.distributionDetails.ageMilestones && selectedBeneficiary.distributionDetails.ageMilestones.length > 0 && ( <div><strong>Age Milestones for Principal:</strong> <ul className="list-disc list-inside pl-4 mt-1 space-y-1">{selectedBeneficiary.distributionDetails.ageMilestones.map((m: any, i: number) => <li key={i}>Age {m.age}: {m.principalPercent}% {m.description || ''}</li>)}</ul> </div> )} <p><strong>Income Distribution:</strong> {selectedBeneficiary.distributionDetails.incomeDistribution || 'N/A'}</p> <p><strong>Principal Distribution (beyond milestones):</strong> {selectedBeneficiary.distributionDetails.principalDistribution || 'N/A'}</p> <p><strong>GST Status (Share):</strong> {selectedBeneficiary.distributionDetails.gstExempt ? <span className="text-green-600 dark:text-green-500">Intended as GST Exempt Share</span> : <span className="text-accent-foreground/90">Potentially GST Non-Exempt Share</span>}</p> {selectedBeneficiary.isSkipPerson && <p className="text-accent-foreground/90 font-semibold">Beneficiary Type: Skip Person. { !selectedBeneficiary.distributionDetails.gstExempt && "GST tax may apply if share is from non-exempt source."}</p>} {selectedBeneficiary.distributionDetails.holdbackProvisions && <p><strong>Holdback Provisions:</strong> {selectedBeneficiary.distributionDetails.holdbackProvisions}</p>} {selectedBeneficiary.distributionDetails.predeceasedContingency && <p><strong>If Beneficiary Predeceases:</strong> {selectedBeneficiary.distributionDetails.predeceasedContingency}</p>} {selectedBeneficiary.distributionDetails.notes && <p><strong>Additional Notes:</strong> {selectedBeneficiary.distributionDetails.notes}</p>} </div> </div> );
});

const NonTrustAssetsDetailsPanel = React.memo(({ selectedNonTrustAssets, onClose, lastFocusedElementRef }: any) => {
    const closeButtonRef = useRef<HTMLButtonElement>(null);
    useEffect(() => {
        if (selectedNonTrustAssets && closeButtonRef.current) {
            closeButtonRef.current.focus();
        }
    }, [selectedNonTrustAssets]);
    
    const handleClose = () => {
        onClose();
        if (lastFocusedElementRef && lastFocusedElementRef.current) {
            lastFocusedElementRef.current.focus();
        }
    };

    if (!selectedNonTrustAssets || selectedNonTrustAssets.length === 0) return null;
    
    const totalNonTrustValue = selectedNonTrustAssets.reduce((sum: number, asset: any) => sum + asset.value, 0);

    return (
        <div className="mt-8 p-6 bg-muted/50 border border-border rounded-lg shadow-md print:hidden" role="dialog" aria-labelledby="nonTrustAssetsDetailsHeading">
            <div className="flex justify-between items-center mb-4">
                <h3 id="nonTrustAssetsDetailsHeading" className="text-2xl font-semibold text-foreground">Non-Trust Assets Details</h3>
                <button ref={closeButtonRef} onClick={handleClose} className="text-sm text-primary hover:text-primary/80 font-medium" aria-label="Close Non-Trust Assets Details">Close X</button>
            </div>
            <p className="text-sm text-muted-foreground mb-3">Total Value of Non-Trust Assets: <span className="font-semibold">{formatCurrency(totalNonTrustValue)}</span></p>
            <div className="space-y-3 text-sm text-foreground">
                {selectedNonTrustAssets.map((asset: any, index: number) => (
                    <div key={index} className="p-2 bg-card border rounded-md">
                        <p><strong>Asset Name:</strong> {asset.name}</p>
                        <p><strong>Value:</strong> {formatCurrency(asset.value)}</p>
                        <p><strong>Type:</strong> {asset.type || 'N/A'}</p>
                        <p><strong>Beneficiaries:</strong> {asset.beneficiaries || 'N/A'}</p>
                    </div>
                ))}
                 <p className="text-xs text-muted-foreground mt-2">Note: These assets typically pass directly to named beneficiaries via beneficiary designations (e.g., on retirement accounts, life insurance) or by title (e.g., JTWROS property) and do not go through the trust or probate.</p>
            </div>
        </div>
    );
});


const DiagramLegend = React.memo(({ planSubType }: any) => { 
    const legendItems = [
        { label: "Joint Estate", fill: "hsl(210, 20%, 92%)", stroke: "hsl(210, 15%, 60%)" },
        { label: "Non-Trust Assets", fill: "hsl(210, 20%, 98%)", stroke: "hsl(210, 15%, 85%)", strokeDasharray: "4 2" },
        { label: "Main Revocable Trust", fill: "hsl(180, 100%, 25%)", stroke: "hsl(180, 100%, 20%)" },
        { label: "Survivor's/RLT (A)", fill: "hsl(200, 80%, 88%)", stroke: "hsl(200, 70%, 65%)" },
        { label: "Bypass Trust (B)", fill: "hsl(50, 100%, 88%)", stroke: "hsl(50, 80%, 60%)" },
    ];
    if (planSubType === 'ABC') {
        legendItems.push({ label: "QTIP Trust (C)", fill: "hsl(270, 60%, 90%)", stroke: "hsl(270, 50%, 60%)" });
    }
    legendItems.push({ label: "Beneficiary", fill: "hsla(120, 60%, 90%, 1)", stroke: "hsl(120, 50%, 55%)" });
    legendItems.push({ label: "Highlighted Flow", colorLine: "hsl(180, 100%, 25%)" });

    return ( <div className="mt-4 pt-2 border-t border-border"> <h4 className="text-sm font-semibold text-muted-foreground mb-1 text-center">Diagram Legend</h4> <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs"> 
        {legendItems.map(item => (
            item.colorLine ? 
            (<div key={item.label} className="flex items-center"><div style={{width: '0.75rem', height: '0.125rem', backgroundColor: item.colorLine, marginRight: '0.25rem'}}></div>{item.label}</div>) :
            (<div key={item.label} className="flex items-center"><div style={{width: '0.75rem', height: '0.75rem', backgroundColor: item.fill, border: `1px solid ${item.stroke}`, strokeDasharray: item.strokeDasharray || 'none', marginRight: '0.25rem'}} className="rounded-sm"></div>{item.label}</div>)
        ))}
    </div> </div> );
});


const DistributionWaterfallSection = React.memo(({ estateData }: any) => { 
    if (!estateData.distributionWaterfall || !Array.isArray(estateData.distributionWaterfall)) return null;
    return ( <div className="mt-8 p-4 bg-card rounded-lg shadow print:shadow-none print:border print:border-border"> <h2 className="text-xl font-semibold text-primary mb-3">Distribution Waterfall</h2> <ul className="list-decimal list-inside pl-2 space-y-2 text-sm text-foreground"> {estateData.distributionWaterfall.map((item: any, index: number) => ( <li key={item.step || `waterfall-${index}`} className="p-2 bg-muted/30 rounded-md print:bg-transparent"> <span className="font-medium text-foreground">{item.description || 'N/A'}:</span> {item.amount && <span className="ml-2 text-green-600 dark:text-green-500 font-semibold">{formatCurrency(item.amount)}</span>} {item.toTrust && estateData.mainRevocableTrust && item.toTrust === estateData.mainRevocableTrust.id && <span className="ml-2 text-primary font-semibold"> Fund {estateData.mainRevocableTrust.name} ({formatCurrency(estateData.mainRevocableTrust.value)}) </span> } {item.toTrust && estateData.subTrusts && estateData.subTrusts.find((t: any) => t.id === item.toTrust) && <span className="ml-2 text-primary font-semibold"> Fund {estateData.subTrusts.find((t: any) => t.id === item.toTrust).name} ({formatCurrency(estateData.subTrusts.find((t: any) => t.id === item.toTrust).value)}) </span> } </li> ))} </ul> </div> );
});


function EstateOverviewPage() { 
  const params = useParams();
  const currentPathname = usePathname();
  const matterId = params.matterId as string;

  const [currentMatter, setCurrentMatter] = useState<Matter | null>(null);
  const [matterClients, setMatterClients] = useState<Contact[]>([]);
  const [matterAssets, setMatterAssets] = useState<Asset[]>([]);
  const [dynamicEstateData, setDynamicEstateData] = useState<any | null>(null);

  const [selectedState, setSelectedState] = useState('OR');
  const [calculatedTax, setCalculatedTax] = useState(0); 
  const [estateValueAfterDebts, setEstateValueAfterDebts] = useState(0);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<any>(null); 
  const [selectedTrust, setSelectedTrust] = useState<any>(null); 
  const [selectedNonTrustAssets, setSelectedNonTrustAssets] = useState<any[] | null>(null);
  const lastFocusedElementRef = useRef<any>(null);

  const [taxAtSecondDeath_NoPlan, setTaxAtSecondDeath_NoPlan] = useState(0);
  const [taxAtSecondDeath_WithPlan, setTaxAtSecondDeath_WithPlan] = useState(0);
  const [estimatedTaxSavings, setEstimatedTaxSavings] = useState(0);
  
  const taxInfo = STATE_ESTATE_TAX_INFO[selectedState];

  useEffect(() => {
    if (matterId) {
        const foundMatter = MOCK_MATTERS_DATA.find(m => m.id === matterId);
        setCurrentMatter(foundMatter || null);
        if (foundMatter) {
            const clients = MOCK_CONTACTS_DATA.filter(c => foundMatter.clientIds.includes(c.id));
            setMatterClients(clients);
            const assets = MOCK_ASSETS_DATA.filter(a => a.matterId === matterId);
            setMatterAssets(assets);
        }
    }
  }, [matterId]);

  useEffect(() => {
    if (currentMatter && matterClients.length > 0 && matterAssets) {
        const totalOverallAssetValue = matterAssets.reduce((sum, asset) => sum + parseAssetValue(asset.value), 0);
        
        const nonTrustAssetsList = matterAssets.filter(asset => 
            asset.category === AssetCategory.RETIREMENT_ACCOUNTS || 
            asset.category === AssetCategory.LIFE_INSURANCE 
        ).map(a => ({ 
            name: a.name, 
            value: parseAssetValue(a.value), 
            type: a.category, 
            beneficiaries: a.primaryBeneficiaries || "Per beneficiary designation forms" 
        }));
        
        const trustAssetsList = matterAssets.filter(asset => 
            !(asset.category === AssetCategory.RETIREMENT_ACCOUNTS || asset.category === AssetCategory.LIFE_INSURANCE)
        ).map(a => ({ name: a.name, value: parseAssetValue(a.value), status: a.status }));
        
        const totalTrustAssetValue = trustAssetsList.reduce((sum, asset) => sum + asset.value, 0);

        let planSubType = 'Individual'; 
        let grantor1 = matterClients[0]?.name || "Client 1";
        let grantor2 = undefined;
        let isActualMarriedCouplePlan = false;

        if (currentMatter.type === "Estate Planning" && matterClients.length > 1) {
            isActualMarriedCouplePlan = true;
            planSubType = currentMatter.id === 'M001' ? 'AB' : 'ABC'; // Example: Default for M001 is AB, others ABC
            grantor2 = matterClients[1]?.name || "Client 2";
        } else if (currentMatter.type === "Estate Planning") {
            planSubType = 'Individual';
        }
        
        const mainTrustName = currentMatter.name || (isActualMarriedCouplePlan && grantor1 && grantor2 
            ? `${grantor1.split(' ')[0]} & ${grantor2.split(' ')[0]} Family Trust` 
            : `${grantor1} Revocable Living Trust`);

        const generatedData: any = {
            grantor1Name: grantor1,
            grantor2Name: grantor2,
            totalOverallValue: totalOverallAssetValue,
            nonTrustAssets: nonTrustAssetsList,
            mainRevocableTrust: {
                id: 'mainRLT',
                name: mainTrustName,
                value: totalTrustAssetValue,
                trustees: matterClients.map(c => c.name),
                successorTrustees: ["Successor Trustee Placeholder 1", "Successor Trustee Placeholder 2"], 
                fundedAssets: trustAssetsList, 
            },
            subTrusts: [],
            distributionWaterfall: [{ step: 1, description: "Debts & Initial Expenses Estimate", amount: Math.min(50000, totalOverallAssetValue * 0.05) }], // Example debt
            planSubType: planSubType,
        };
        
        const placeholderBeneficiaries = [
            { id: "ben_child1", name: "Child One Placeholder", sharePercent: 50, isSkipPerson: false, distributionDetails: { type: "Outright", predeceasedContingency: "To issue", gstExempt: true } },
            { id: "ben_child2", name: "Child Two Placeholder", sharePercent: 50, isSkipPerson: false, distributionDetails: { type: "In Trust", predeceasedContingency: "To issue", gstExempt: true } },
        ];
        const defaultSuccessorTrustees = matterClients.length > 1 ? [grantor2 || "Surviving Spouse", "Successor Placeholder"] : ["Successor Placeholder"];

        if (planSubType === 'AB' && isActualMarriedCouplePlan) {
            const exemptionAmount = STATE_ESTATE_TAX_INFO[selectedState]?.exemption || STATE_ESTATE_TAX_INFO.Federal.exemption;
            const bypassValue = Math.min(totalTrustAssetValue / 2, exemptionAmount);
            const survivorValue = totalTrustAssetValue - bypassValue;
            generatedData.subTrusts = [
                { id: "trustB", name: `${grantor1.split(' ')[0]} Bypass Trust`, value: bypassValue, trustees: defaultSuccessorTrustees.slice(1), allocatedAssetNames: trustAssetsList.slice(0, Math.ceil(trustAssetsList.length / 2)).map(a=>a.name), isIrrevocable: true, beneficiaries: placeholderBeneficiaries, gstExemptionAllocated: "Full (deceased spouse's)", trustPurpose: "Utilize deceased spouse's estate tax exemption." },
                { id: "trustA", name: `${grantor1.split(' ')[0]} Survivor's Trust`, value: survivorValue, trustees: [grantor2 || "Surviving Spouse Placeholder"], allocatedAssetNames: trustAssetsList.slice(Math.ceil(trustAssetsList.length / 2)).map(a=>a.name), isIrrevocable: false, beneficiaries: placeholderBeneficiaries, gstExemptionAllocated: "Survivor may allocate" },
            ];
             generatedData.distributionWaterfall.push({ step: 2, toTrust: "mainRLT", description: `Fund ${mainTrustName}` }, { step: 3, toTrust: "trustB", description: "Fund Bypass Trust from Main Trust" }, { step: 4, toTrust: "trustA", description: "Fund Survivor's Trust from Main Trust" });
        } else if (planSubType === 'ABC' && isActualMarriedCouplePlan) {
             const exemptionAmount = STATE_ESTATE_TAX_INFO[selectedState]?.exemption || STATE_ESTATE_TAX_INFO.Federal.exemption;
             const bypassValue = Math.min(totalTrustAssetValue / 2, exemptionAmount);
             const qtipValue = Math.max(0, (totalTrustAssetValue / 2) - bypassValue); 
             const survivorValue = totalTrustAssetValue / 2; 
            generatedData.subTrusts = [
                { id: "trustB", name: `${grantor1.split(' ')[0]} Bypass Trust`, value: bypassValue, trustees: defaultSuccessorTrustees.slice(1), isIrrevocable: true, beneficiaries: placeholderBeneficiaries, gstExemptionAllocated: "Full (deceased spouse's)" },
                { id: "trustC", name: `${grantor1.split(' ')[0]} QTIP Trust`, value: qtipValue, trustees: [grantor2 || "Surviving Spouse Placeholder", "Independent Co-Trustee"], isIrrevocable: true, beneficiaries: placeholderBeneficiaries, gstExemptionAllocated: "Reverse QTIP Election (possible)" },
                { id: "trustA", name: `${grantor1.split(' ')[0]} Survivor's Trust`, value: survivorValue, trustees: [grantor2 || "Surviving Spouse Placeholder"], isIrrevocable: false, beneficiaries: placeholderBeneficiaries, gstExemptionAllocated: "Survivor may allocate" },
            ];
            generatedData.distributionWaterfall.push({ step: 2, toTrust: "mainRLT", description: `Fund ${mainTrustName}` }, { step: 3, toTrust: "trustB", description: "Fund Bypass Trust" }, { step: 4, toTrust: "trustC", description: "Fund QTIP Trust" }, { step: 5, toTrust: "trustA", description: "Fund Survivor's Trust" });
        } else { 
            generatedData.mainRevocableTrust.beneficiaries = placeholderBeneficiaries; 
            generatedData.subTrusts = []; 
            generatedData.distributionWaterfall.push({ step: 2, toTrust: "mainRLT", description: `Fund ${mainTrustName}` });
        }
        setDynamicEstateData(generatedData);
    } else {
        setDynamicEstateData(null); 
    }
  }, [currentMatter, matterClients, matterAssets, selectedState]); 


  const isMarriedCouplePlan = !!dynamicEstateData?.grantor2Name; 
  const currentPlanSubType = dynamicEstateData?.planSubType; 


  useEffect(() => {
    if (!dynamicEstateData || !taxInfo) { 
      setCalculatedTax(0);
      setEstateValueAfterDebts(dynamicEstateData?.totalOverallValue || 0);
      setTaxAtSecondDeath_NoPlan(0);
      setTaxAtSecondDeath_WithPlan(0);
      setEstimatedTaxSavings(0);
      return;
    }
    const totalInitialValue = dynamicEstateData.totalOverallValue || 0;
    let initialDebtsAndExpenses = 0;
    if (dynamicEstateData.distributionWaterfall && Array.isArray(dynamicEstateData.distributionWaterfall) && dynamicEstateData.distributionWaterfall.length > 0) {
        const firstStep = dynamicEstateData.distributionWaterfall[0];
        if (firstStep.description && (firstStep.description.toLowerCase().includes("funeral expenses") || firstStep.description.toLowerCase().includes("debts"))) {
            initialDebtsAndExpenses = firstStep.amount || 0;
        }
    }
    const currentEstateValueAfterDebts = totalInitialValue - initialDebtsAndExpenses;
    setEstateValueAfterDebts(currentEstateValueAfterDebts);

    if (isMarriedCouplePlan && taxInfo.exemption !== null) {
        const deceasedSpouseShareNet = (totalInitialValue / 2) - (initialDebtsAndExpenses / 2); 
        const survivingSpouseShareNet = (totalInitialValue / 2) - (initialDebtsAndExpenses / 2); 
        const firstSpouseExemption = taxInfo.exemption || 0;
        const survivorTaxableEstate_NoPlan = currentEstateValueAfterDebts;
        const tax_NoPlan = calculateTaxInternal(survivorTaxableEstate_NoPlan, selectedState);
        setTaxAtSecondDeath_NoPlan(tax_NoPlan);
        let tax_WithPlan = 0;
        if (currentPlanSubType === 'AB') { 
            const amountToTrustB = Math.min(deceasedSpouseShareNet, firstSpouseExemption);
            const survivorTaxableEstate_WithAB = survivingSpouseShareNet + Math.max(0, deceasedSpouseShareNet - amountToTrustB);
            tax_WithPlan = calculateTaxInternal(survivorTaxableEstate_WithAB, selectedState);
        } else if (currentPlanSubType === 'ABC') { 
            const trustB = dynamicEstateData.subTrusts.find((t: any) => t.id === 'trustB');
            const trustC = dynamicEstateData.subTrusts.find((t: any) => t.id === 'trustC'); 
            const amountToTrustB = trustB ? trustB.value : Math.min(deceasedSpouseShareNet, firstSpouseExemption); 
            const amountToTrustC = trustC ? trustC.value : 0; 
            const survivorTaxableEstate_WithABC = survivingSpouseShareNet + Math.max(0, deceasedSpouseShareNet - amountToTrustB - amountToTrustC) + amountToTrustC; 
            tax_WithPlan = calculateTaxInternal(survivorTaxableEstate_WithABC, selectedState);
        }
        setTaxAtSecondDeath_WithPlan(tax_WithPlan);
        setEstimatedTaxSavings(Math.max(0, tax_NoPlan - tax_WithPlan));
        setCalculatedTax(0); 
    } else { 
        let taxableEstate = currentEstateValueAfterDebts;
        let tax = 0;
        if (taxInfo.exemption !== null && taxableEstate > taxInfo.exemption) {
            tax = calculateTaxInternal(taxableEstate, selectedState);
        }
        setCalculatedTax(Math.max(0, tax));
        setTaxAtSecondDeath_NoPlan(0);
        setTaxAtSecondDeath_WithPlan(0);
        setEstimatedTaxSavings(0);
    }
  }, [dynamicEstateData, selectedState, taxInfo, isMarriedCouplePlan, currentPlanSubType]); 

  const handleBeneficiaryClick = useCallback((beneficiary: any, primaryTrustId: string, isCombinedViewType: any = null) => {
    if (!dynamicEstateData || !dynamicEstateData.subTrusts) return; 
    
    const trustSourceArray = primaryTrustId === dynamicEstateData.mainRevocableTrust?.id 
                            ? [dynamicEstateData.mainRevocableTrust] 
                            : dynamicEstateData.subTrusts; 
    
    const trust = trustSourceArray?.find((t: any) => t.id === primaryTrustId);
    
    if (trust && trust.beneficiaries) {
        const fullBeneficiaryData = trust.beneficiaries.find((b: any) => b.id === beneficiary.id);
        if (fullBeneficiaryData) {
             let trustNameDisplay = trust.name;
             if (isCombinedViewType === 'AB') trustNameDisplay = "Family Trusts (A&B)";
             if (isCombinedViewType === 'BC') trustNameDisplay = "Family Remainder Trusts (B&C)";
             setSelectedBeneficiary((prev: any) => 
                (prev && prev.id === fullBeneficiaryData.id && (prev.trustId === primaryTrustId || prev.isCombinedViewType === isCombinedViewType)) 
                ? null 
                : { ...fullBeneficiaryData, id: beneficiary.id, trustId: primaryTrustId, trustName: trustNameDisplay, isCombinedViewType } 
             );
             setSelectedTrust(null);
             setSelectedNonTrustAssets(null);
        }
    }
  }, [dynamicEstateData]); 

  const handleTrustClick = useCallback((trustData: any) => {
    setSelectedTrust((prev: any) => (prev && prev.id === trustData.id ? null : trustData));
    setSelectedBeneficiary(null);
    setSelectedNonTrustAssets(null);
  }, []);
  
  const handleNonTrustAssetsClick = useCallback(() => {
    if (dynamicEstateData && dynamicEstateData.nonTrustAssets) {
        setSelectedNonTrustAssets(prev => prev ? null : dynamicEstateData.nonTrustAssets);
        setSelectedTrust(null);
        setSelectedBeneficiary(null);
    }
  }, [dynamicEstateData]);

  const handleStateChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedState(e.target.value);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const primaryClientIdForRibbon = useMemo(() => {
    return matterClients.length > 0 ? matterClients[0].id : undefined;
  }, [matterClients]);

  if (!currentMatter || !dynamicEstateData) { 
    return <div className="p-4 text-center text-muted-foreground">Loading estate data for matter {matterId}...</div>;
  }
  
  const planNameString = dynamicEstateData.planSubType === 'AB' ? "A/B Trust" : dynamicEstateData.planSubType === 'ABC' ? "A/B/C (QTIP) Trust" : "Individual";
  const showGstNote = isMarriedCouplePlan || (dynamicEstateData.subTrusts && dynamicEstateData.subTrusts.some((t: any) => t.id === 'trust2' || t.gstExemptionAllocated)); 

  return (
    <div className="p-6 bg-background font-sans rounded-lg shadow-lg" id="trust-flow-visualizer-container">
      <MatterActionRibbon matterId={matterId} matterType={currentMatter?.type} primaryClientId={primaryClientIdForRibbon} currentPathname={currentPathname} />
      <style>{`@media print { body * { visibility: hidden; } #trust-flow-visualizer-container, #trust-flow-visualizer-container * { visibility: visible; } #trust-flow-visualizer-container { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 20px; box-shadow: none; border: none; } .print-hidden { display: none !important; } .print-shadow-none { box-shadow: none !important; } .print-border { border: 1px solid hsl(var(--border)) !important; } .print-bg-transparent { background-color: transparent !important; } .print-p-0 { padding: 0 !important; } .print-grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)) !important; } .print-text-sm { font-size: 0.875rem !important; } .print-text-xs { font-size: 0.75rem !important; } .svg-diagram-print-container svg { max-width: 100% !important; height: auto !important; } }`}</style>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-center text-primary">Estate Plan &amp; Trust Flow Visualization</h1>
        <button onClick={handlePrint} className="print-hidden px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">Print Diagram</button>
      </div>

      <div className="mb-6 p-4 bg-card rounded-lg shadow print:shadow-none print:border print:border-border">
        <h2 className="text-xl font-semibold text-primary mb-2">Matter: {currentMatter.name}</h2>
        <h3 className="text-lg text-foreground mb-1">Grantor(s): {dynamicEstateData.grantor1Name} {dynamicEstateData.grantor2Name && `&amp; ${dynamicEstateData.grantor2Name}`}</h3>
        <p className="text-lg text-foreground">Total Initial Estate Value: <span className="font-bold">{formatCurrency(dynamicEstateData.totalOverallValue)}</span></p>
        {dynamicEstateData.planSubType !== 'Individual' && <p className="text-md text-muted-foreground">Plan Type: {planNameString} Planning</p>}
      </div>

      <TaxImplicationsSection
        selectedState={selectedState}
        onStateChange={handleStateChange}
        taxInfo={taxInfo}
        estateValueAfterDebts={estateValueAfterDebts}
        isMarriedCouplePlan={!!dynamicEstateData.grantor2Name}
        calculatedTax={calculatedTax}
        taxAtSecondDeath_NoPlan={taxAtSecondDeath_NoPlan}
        taxAtSecondDeath_WithPlan={taxAtSecondDeath_WithPlan}
        estimatedTaxSavings={estimatedTaxSavings}
        planName={planNameString}
        showGstNote={showGstNote}
      />
      
      <div className="mb-6 p-4 bg-card rounded-lg shadow print:shadow-none print:border print:border-border svg-diagram-print-container">
        <h2 id="diagramTitle" className="text-xl font-semibold text-primary mb-4 text-center">Asset Flow Diagram</h2>
        <SvgDiagram 
            estateData={dynamicEstateData} 
            selectedTrust={selectedTrust}
            selectedBeneficiary={selectedBeneficiary}
            selectedNonTrustAssets={selectedNonTrustAssets}
            onTrustClick={handleTrustClick}
            onBeneficiaryClick={handleBeneficiaryClick}
            onNonTrustAssetsClick={handleNonTrustAssetsClick}
            isMarriedCouplePlan={!!dynamicEstateData.grantor2Name}
            planSubType={dynamicEstateData.planSubType} 
            setLastFocusedElement={(el: any) => lastFocusedElementRef.current = el}
        />
        <DiagramLegend planSubType={dynamicEstateData.planSubType} /> 
      </div>

      <TrustDetailsPanel 
        selectedTrust={selectedTrust} 
        onClose={() => setSelectedTrust(null)} 
        lastFocusedElementRef={lastFocusedElementRef} 
      />
      <BeneficiaryDetailsPanel 
        selectedBeneficiary={selectedBeneficiary} 
        onClose={() => setSelectedBeneficiary(null)} 
        lastFocusedElementRef={lastFocusedElementRef}
      />
      <NonTrustAssetsDetailsPanel
        selectedNonTrustAssets={selectedNonTrustAssets}
        onClose={() => setSelectedNonTrustAssets(null)}
        lastFocusedElementRef={lastFocusedElementRef}
      />
      <DistributionWaterfallSection estateData={dynamicEstateData} /> 
    </div>
  );
};


export default EstateOverviewPage; // Default export for the page
    
