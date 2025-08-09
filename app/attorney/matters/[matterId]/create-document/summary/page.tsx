
"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { AlertTriangle, ArrowLeft, Save, Users, FileText, CalendarCheck2, ShieldCheck, Home, Gift, Banknote, Settings2, UserCheck } from 'lucide-react';
import type { Matter, Contact, Document as DocType, MatterType } from '@/lib/types'; // Added MatterType
import { MOCK_DOCUMENTS_DATA, MOCK_MATTERS_DATA, MOCK_CONTACTS_DATA } from '@/lib/mock-data';
import { toast } from "@/hooks/use-toast";
import { SummarySection, SummaryItem, renderValue } from '@/components/shared/summary-components';
import { MatterActionRibbon } from '@/components/layout/matter-action-ribbon';

interface StoredSummaryData {
  formData: any;
  matter: Matter | null;
  client: Contact | null;
  client2?: Contact | null;
  formTitle: string;
  docType: string;
  subType?: string;
}

const SimpleList = ({ items, title }: { items: (string | undefined)[]; title: string }) => {
  const filteredItems = items.filter(Boolean);
  if (filteredItems.length === 0) {
    return <SummaryItem label={title} value="None specified" />;
  }
  return (
    <SummaryItem
      label={title}
      value={
        <ul className="list-disc pl-5">
          {filteredItems.map((item, idx) => <li key={idx}>{item}</li>)}
        </ul>
      }
    />
  );
};

const renderRltJointSummary = (data: any, client?: Contact | null, client2?: Contact | null) => {
  const formData = data || {};
  const client1Name = client?.name || "Trustor 1";
  const client2Name = client2?.name || "Trustor 2";

  const renderTrusteeSet = (trustees: any[], title: string) => {
    if (!trustees || trustees.length === 0) return <SummaryItem label={title} value="None specified" />;
    return (
      <div className="mt-2 space-y-2">
        <h4 className="font-semibold text-sm text-muted-foreground">{title}:</h4>
        {trustees.map((trustee, idx) => (
          <Card key={idx} className="p-3 bg-background/50">
            <SummaryItem label={`Trustee ${idx + 1} Name`} value={trustee.name} />
            <SummaryItem label="Role Type" value={trustee.role_type} />
            <SummaryItem label="Relationship" value={trustee.relationship} />
            {trustee.has_co_trustee === 'Yes' && (
              <>
                <SummaryItem label="Has Co-Trustee?" value="Yes" />
                <SummaryItem label="Co-Trustee Name" value={trustee.co_trustee_name} />
                <SummaryItem label="Co-Trustee Role Type" value={trustee.co_trustee_role_type} />
                <SummaryItem label="Co-Trustees Acting" value={trustee.co_trustees_acting_option} />
              </>
            )}
          </Card>
        ))}
      </div>
    );
  };

  const renderGiftList = (gifts: any[], giftType: string) => {
    if (!gifts || gifts.length === 0) return <SummaryItem label={`${giftType} Gifts`} value="None specified" />;
    return (
      <>
        {gifts.map((gift, idx) => (
          <Card key={idx} className="p-3 my-2 bg-background/50">
            <h4 className="font-semibold text-sm text-primary mb-1">{`${giftType} Gift ${idx + 1}: ${gift.name || 'N/A'}`}</h4>
            <SummaryItem label="Description" value={gift.description} />
            <SummaryItem label="Timing" value={gift.timing} />
            <SummaryItem label="Kind" value={gift.gift_kind === 'Other' ? `Other: ${gift.gift_kind_other}` : gift.gift_kind} />
            <SummaryItem label="Expense Bearer" value={gift.expense_bearer} />
            <SummaryItem label="Tax Payer" value={gift.tax_payer} />
            <SummaryItem label="Distribution Type" value={gift.distribution_type} />
            <SummaryItem label="Lapse Provision" value={gift.lapse_provision_type} />
            <SummaryItem label="Notes" value={gift.notes} />
          </Card>
        ))}
      </>
    );
  };


  return (
    <>
      <SummarySection title="Trustor Information" className="border-blue-200">
        <Card className="p-3 bg-blue-50/30 mb-2">
          <h3 className="font-semibold text-md text-blue-700 mb-1">{client1Name}</h3>
          <SummaryItem label="AKA" value={formData.trustor1_aka} />
          <SummaryItem label="Gender" value={formData.trustor1_gender} />
          <SummaryItem label="Date of Birth" value={formData.trustor1_dob} />
          <SummaryItem label="Residence" value={formData.trustor1_residence} />
        </Card>
        {client2 && (
          <Card className="p-3 bg-blue-50/30">
            <h3 className="font-semibold text-md text-blue-700 mb-1">{client2Name}</h3>
            <SummaryItem label="AKA" value={formData.trustor2_aka} />
            <SummaryItem label="Gender" value={formData.trustor2_gender} />
            <SummaryItem label="Date of Birth" value={formData.trustor2_dob} />
            <SummaryItem label="Residence" value={formData.trustor2_residence} />
          </Card>
        )}
      </SummarySection>

      <SummarySection title="Children Information" className="border-green-200">
        <SummaryItem label="Have Children?" value={formData.have_children} />
        {formData.have_children === 'Yes' && formData.children?.length > 0 && (
          <div className="mt-2 space-y-2">
            <h4 className="font-semibold text-sm text-muted-foreground">Children Details:</h4>
            {formData.children.map((child: any, index: number) => (
              <Card key={index} className="p-3 bg-green-50/30">
                <SummaryItem label={`Child ${index + 1} Name`} value={child.name} />
                <SummaryItem label="Date of Birth" value={child.dob} />
                <SummaryItem label="Gender" value={child.gender} />
                <SummaryItem label="Relationship" value={child.relationship} />
                <SummaryItem label="Address" value={child.address} />
              </Card>
            ))}
          </div>
        )}
        <SummaryItem label="Any Deceased Children (who left issue)?" value={formData.any_deceased_children} />
         {formData.any_deceased_children === 'Yes' && formData.deceased_children?.length > 0 && (
          <div className="mt-2 space-y-2">
            <h4 className="font-semibold text-sm text-muted-foreground">Deceased Children Details:</h4>
            {formData.deceased_children.map((child: any, index: number) => (
              <Card key={index} className="p-3 bg-yellow-50/30">
                <SummaryItem label={`Deceased Child ${index + 1} Name`} value={child.name} />
                <SummaryItem label="Date of Death" value={child.dod} />
                <SummaryItem label="Left Issue?" value={child.left_issue} />
                <SummaryItem label="Issue Names" value={child.issue_names} />
              </Card>
            ))}
          </div>
        )}
        <SummaryItem label="Any Disinherited Individuals?" value={formData.any_disinherited_children} />
        {formData.any_disinherited_children === 'Yes' && formData.disinherited_children?.length > 0 && (
           <div className="mt-2 space-y-2">
             <h4 className="font-semibold text-sm text-muted-foreground">Disinherited Individuals Details:</h4>
            {formData.disinherited_children.map((child: any, index: number) => (
              <Card key={index} className="p-3 bg-red-50/30">
                <SummaryItem label={`Disinherited Individual ${index + 1} Name`} value={child.name} />
                <SummaryItem label="Reason" value={child.reason} />
                <SummaryItem label="Disinherit Descendants?" value={child.disinherit_descendants} />
              </Card>
            ))}
          </div>
        )}
      </SummarySection>

      <SummarySection title="Guardians & Fiduciaries" className="border-purple-200">
        <SummaryItem label="Name Guardians for Minor Children?" value={formData.name_guardians} />
        {formData.name_guardians === 'Yes' && (
          <>
            <SummaryItem label="Guardian 1 Name" value={formData.guardian1_name} />
            <SummaryItem label="Guardian 1 Choice Type" value={formData.guardian1_choice_type} />
            <SummaryItem label="Guardian 2 Name" value={formData.guardian2_name} />
            <SummaryItem label="Guardian 2 Choice Type" value={formData.guardian2_choice_type} />
            <SummaryItem label="Guardian Notes" value={formData.guardian_notes} />
          </>
        )}
        <SummaryItem label="Spouse Automatically First Fiduciary?" value={formData.spouse_auto_fiduciary} />

        <h4 className="font-semibold text-md text-purple-700 mt-3 pt-2 border-t">Financial Agents</h4>
        <SimpleList items={[formData.trustor1_fin_agent1_name, formData.trustor1_fin_agent2_name, formData.trustor1_fin_agent3_name]} title={`${client1Name}'s Financial Agents`} />
        {client2 && <SimpleList items={[formData.trustor2_fin_agent1_name, formData.trustor2_fin_agent2_name, formData.trustor2_fin_agent3_name]} title={`${client2Name}'s Financial Agents`} />}

        <h4 className="font-semibold text-md text-purple-700 mt-3 pt-2 border-t">Health Care Agents</h4>
        <SimpleList items={[formData.trustor1_hc_agent1_name, formData.trustor1_hc_agent2_name, formData.trustor1_hc_agent3_name]} title={`${client1Name}'s Health Care Agents`} />
        {client2 && <SimpleList items={[formData.trustor2_hc_agent1_name, formData.trustor2_hc_agent2_name, formData.trustor2_hc_agent3_name]} title={`${client2Name}'s Health Care Agents`} />}

        <h4 className="font-semibold text-md text-purple-700 mt-3 pt-2 border-t">Advance Directive Agents</h4>
        <SummaryItem label={`${client1Name}: AD Agents same as HC?`} value={formData.trustor1_ad_same_as_hc} />
        {formData.trustor1_ad_same_as_hc === 'No' && <SimpleList items={[formData.trustor1_ad_agent1_name, formData.trustor1_ad_agent2_name, formData.trustor1_ad_agent3_name]} title={`${client1Name}'s AD Agents`} />}
        {client2 && <SummaryItem label={`${client2Name}: AD Agents same as HC?`} value={formData.trustor2_ad_same_as_hc} />}
        {client2 && formData.trustor2_ad_same_as_hc === 'No' && <SimpleList items={[formData.trustor2_ad_agent1_name, formData.trustor2_ad_agent2_name, formData.trustor2_ad_agent3_name]} title={`${client2Name}'s AD Agents`} />}

        <h4 className="font-semibold text-md text-purple-700 mt-3 pt-2 border-t">HIPAA Authorization</h4>
        <SummaryItem label={`${client1Name}: Additional HIPAA Auth?`} value={formData.trustor1_additional_hipaa_authorization} />
        {formData.trustor1_additional_hipaa_authorization === 'Yes' && <SummaryItem label="Additional Names" value={formData.trustor1_additional_hipaa_names} />}
        {client2 && <SummaryItem label={`${client2Name}: Additional HIPAA Auth?`} value={formData.trustor2_additional_hipaa_authorization} />}
        {client2 && formData.trustor2_additional_hipaa_authorization === 'Yes' && <SummaryItem label="Additional Names" value={formData.trustor2_additional_hipaa_names} />}
      </SummarySection>

      <SummarySection title="Trust Details" className="border-orange-200">
        <SummaryItem label="Trust Name" value={formData.trust_name} />
        <SummaryItem label="Trust Execution Type" value={formData.trust_execution_type} />
        {formData.trust_execution_type === 'Restatement' && (
          <>
            <SummaryItem label="Original Trust Date" value={formData.trust_original_date} />
            <SummaryItem label="Authority to Amend/Restate" value={formData.trust_authority_amend} />
            <SummaryItem label="Prior Amendments/Restatements" value={formData.prior_amendments_restatements} />
          </>
        )}
        <SummaryItem label="Current Trust Date / Restatement Date" value={formData.current_trust_date} />
        <SummaryItem label="State of Controlling Law" value={formData.trust_controlling_law_state} />
        <SummaryItem label="Include Prenuptial Language?" value={formData.trust_prenuptial_language} />
        <SummaryItem label="Investment Standard" value={formData.trust_investment_standard} />
        <SummaryItem label="Investment Standard Applicable to Surviving Spouse?" value={formData.trust_investment_standard_surviving_spouse} />
        <SummaryItem label="No Contest Clause" value={formData.trust_no_contest_clause} />
        <SummaryItem label="Can Co-Trustees Act Independently?" value={formData.trust_co_trustee_act_independently} />
        <h4 className="font-semibold text-sm text-muted-foreground mt-2">Initial Trustees:</h4>
        <SummaryItem label={`${client1Name} as Initial Trustee`} value={formData.trust_initial_trustor1} />
        {formData.trust_initial_trustor1 === true && <SummaryItem label={`${client1Name} Acts Independently?`} value={formData.trust_initial_trustor1_act_independently}/>}
        <SummaryItem label={`${client2Name} as Initial Trustee`} value={formData.trust_initial_trustor2} />
        {formData.trust_initial_trustor2 === true && <SummaryItem label={`${client2Name} Acts Independently?`} value={formData.trust_initial_trustor2_act_independently}/>}
        <SummaryItem label="Additional Initial Trustee Exists?" value={formData.trust_initial_additional_trustee_exists} />
        {formData.trust_initial_additional_trustee_exists === true && (
          <>
            <SummaryItem label="Additional Trustee Name" value={formData.trust_initial_additional_trustee_name} />
            <SummaryItem label="Additional Trustee Acts Independently?" value={formData.trust_initial_additional_trustee_act_independently} />
          </>
        )}
        <h4 className="font-semibold text-sm text-muted-foreground mt-2">Successor Trustees:</h4>
        <SummaryItem label="Same as Financial Agents?" value={formData.successor_trustees_same_as_financial_agents} />
        <SummaryItem label="Are Successor Trustees Joint?" value={formData.are_successor_trustees_joint} />
        <SummaryItem label="Successor Trustee Option" value={formData.successor_trustee_option} />
        {formData.are_successor_trustees_joint === 'Yes' && renderTrusteeSet(formData.joint_successor_trustees, "Joint Successor Trustees")}
        {formData.are_successor_trustees_joint === 'No' && (
          <>
            {renderTrusteeSet(formData.trustor1_successor_trustees, `${client1Name}'s Successor Trustees`)}
            {renderTrusteeSet(formData.trustor2_successor_trustees, `${client2Name}'s Successor Trustees`)}
          </>
        )}
         <SummaryItem label="QDOT Trustee Named?" value={formData.qdot_trustee_named} />
         {formData.qdot_trustee_named === 'Yes' && (
           <>
            <SummaryItem label="QDOT Trustee 1" value={formData.qdot_trustee1_name} />
            <SummaryItem label="QDOT Trustee 2" value={formData.qdot_trustee2_name} />
            <SummaryItem label="QDOT Co-Trustees?" value={formData.qdot_co_trustees} />
           </>
         )}
        <SummaryItem label="Want Trust Protector?" value={formData.want_trust_protector} />
        {formData.want_trust_protector === 'Yes' && <SummaryItem label="Trust Protector Name" value={formData.trust_protector_name} />}
        <SummaryItem label="Survivor Power to Change Trustee?" value={formData.survivor_power_change_trustee} />
        <SummaryItem label="Survivor Can Appoint Special Co-Trustee?" value={formData.survivor_can_appoint_special_co_trustee} />
        <SummaryItem label="Removal of Trustees by Others Criteria" value={formData.removal_trustees_by_others_criteria} />
        <SummaryItem label="Want Incapacity Panel?" value={formData.want_incapacity_panel} />
        {formData.want_incapacity_panel === 'Yes' && (
          <div className="ml-4">
            <SummaryItem label={`${client1Name} Panel Members`} value={[formData.trustor1_incapacity_panel_member1, formData.trustor1_incapacity_panel_member2, formData.trustor1_incapacity_panel_member3].filter(Boolean).join(', ') || "None"} />
            <SummaryItem label={`${client1Name} Panel Consent`} value={formData.trustor1_incapacity_panel_consent} />
            <SummaryItem label={`${client2Name} Panel Members`} value={[formData.trustor2_incapacity_panel_member1, formData.trustor2_incapacity_panel_member2, formData.trustor2_incapacity_panel_member3].filter(Boolean).join(', ') || "None"} />
            <SummaryItem label={`${client2Name} Panel Consent`} value={formData.trustor2_incapacity_panel_consent} />
          </div>
        )}
        <SummaryItem label="Notes for Trust Details" value={formData.notes_trust_details} />
      </SummarySection>

      <SummarySection title="Distribution Plan" className="border-lime-200">
        <SummaryItem label="Trust Property Shares" value={formData.trust_property_shares} />
        <SummaryItem label="Draft Three Certificates of Trust?" value={formData.draft_three_certificates} />
        <SummaryItem label="TPP Distribution" value={formData.tpp_distribution} />
        {formData.tpp_distribution === 'Equally to' && <SummaryItem label="TPP Equally To Names" value={formData.tpp_equally_to_names} />}
        <SummaryItem label="TPP Other Notes" value={formData.tpp_other_notes} />

        <SummaryItem label="Any Specific Charity Distributions?" value={formData.any_specific_distributions_charity} />
        {formData.any_specific_distributions_charity === 'Yes' && renderGiftList(formData.charity_distributions, "Charity")}

        <SummaryItem label="Any Specific Individual Distributions?" value={formData.any_specific_distributions_individuals} />
        {formData.any_specific_distributions_individuals === 'Yes' && renderGiftList(formData.individual_gifts, "Individual")}

        <SummaryItem label="Common Pot Trust Option" value={formData.common_pot_trust_option} />
        {(formData.common_pot_trust_option === "Common Pot until Youngest Specified Age" || formData.common_pot_trust_option === "Common Pot until Youngest Specified Age or College") &&
         <SummaryItem label="Common Pot Specified Age" value={formData.common_pot_specified_age || formData.common_pot_alt_specified_age} />
        }
        <SummaryItem label="Retirement Preservation Trust?" value={formData.retirement_preservation_trust} />
        {formData.retirement_preservation_trust === 'Yes' && (
          <>
            <SummaryItem label="Retirement Preservation Names Match Residual?" value={formData.retirement_preservation_names_match_residual} />
            {formData.retirement_preservation_names_match_residual === 'No' && <SummaryItem label="Retirement Preservation Names List" value={formData.retirement_preservation_names_list} />}
            <SummaryItem label="Retirement Trust Type" value={formData.retirement_trust_type} />
            <SummaryItem label="Retirement Trust Optional POA" value={formData.retirement_trust_optional_poa} />
            {formData.retirement_trust_optional_poa === 'Yes, Except' && <SummaryItem label="Retirement Trust Optional POA Except" value={formData.retirement_trust_optional_poa_except} />}
          </>
        )}
        <SummaryItem label="Beneficiary Nuptial Required?" value={formData.beneficiary_nuptial_required} />
        <SummaryItem label="Residual Distribution Main Option" value={formData.residual_distribution_main_option} />
        <SummaryItem label="Notes on Distribution" value={formData.notes_distribution} />
      </SummarySection>

      <SummarySection title="Advanced Provisions" className="border-cyan-200">
        <SummaryItem label="Funding - Qualified Asset Checklist Used?" value={formData.funding_qualified_asset_checklist} />
        <SummaryItem label="Funding - Qualified Beneficiary Option" value={formData.funding_qualified_beneficiary_option} />
        <SummaryItem label="Adv. Prov. - Duty to Account (Surviving)" value={formData.adv_prov_duty_to_account_surviving} />
        <SummaryItem label="Adv. Prov. - Duty to Account (Successor)" value={formData.adv_prov_duty_to_account_successor} />
        <SummaryItem label="Adv. Prov. - Trust Division Type" value={formData.adv_prov_trust_division_type} />
        <SummaryItem label="Notes on Advanced Provisions" value={formData.notes_advanced_provisions} />
      </SummarySection>

      <SummarySection title="Capacity Confirmation" className="border-red-200">
        <SummaryItem label={`${client1Name} - Understands Planning`} value={formData.t1_cap_understands_planning} />
        <SummaryItem label={`${client1Name} - Knows Children`} value={formData.t1_cap_knows_children} />
        <SummaryItem label={`${client1Name} - Knows Estate Value`} value={formData.t1_cap_knows_estate_value} />
        <SummaryItem label={`${client1Name} - Understands Bequests`} value={formData.t1_cap_understands_bequests} />
        <SummaryItem label={`${client1Name} - Understands Powers`} value={formData.t1_cap_understands_powers} />
        {client2 && (
          <>
            <SummaryItem label={`${client2Name} - Understands Planning`} value={formData.t2_cap_understands_planning} />
            <SummaryItem label={`${client2Name} - Knows Children`} value={formData.t2_cap_knows_children} />
            <SummaryItem label={`${client2Name} - Knows Estate Value`} value={formData.t2_cap_knows_estate_value} />
            <SummaryItem label={`${client2Name} - Understands Bequests`} value={formData.t2_cap_understands_bequests} />
            <SummaryItem label={`${client2Name} - Understands Powers`} value={formData.t2_cap_understands_powers} />
          </>
        )}
        <SummaryItem label="Attorney Initials for Capacity" value={formData.attorney_initials_capacity} />
        <SummaryItem label="Notes on Capacity" value={formData.notes_capacity_confirmation} />
      </SummarySection>

      <Card className="mt-6 bg-muted/50">
        <CardHeader><CardTitle className="text-lg flex items-center"><Settings2 className="w-5 h-5 mr-2 text-muted-foreground"/>Raw Form Data (Debug)</CardTitle></CardHeader>
        <CardContent className="text-xs max-h-96 overflow-auto p-2"><pre>{JSON.stringify(formData, null, 2)}</pre></CardContent>
      </Card>
    </>
  );
};

const renderGenericSummary = (data: any) => {
     if (typeof data !== 'object' || data === null) {
        return <p>No data to display.</p>;
    }
    return (
        <div className="space-y-3">
            {Object.entries(data).map(([key, value]) => (
                <SummaryItem key={key} label={key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} value={value} />
            ))}
        </div>
    );
};


export default function DocumentSummaryPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const currentPathname = usePathname();

  const matterId = params.matterId as string;
  const docType = searchParams.get('docType');
  const formTitleFromQuery = searchParams.get('formTitle') || "Document Summary";

  const [summaryData, setSummaryData] = useState<StoredSummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [primaryClientIdForRibbon, setPrimaryClientIdForRibbon] = useState<string | number | undefined>(undefined);
  const [currentMatterType, setCurrentMatterType] = useState<MatterType | undefined>(undefined);

  useEffect(() => {
    const storedDataString = sessionStorage.getItem('pendingFormSummaryData');
    if (storedDataString) {
      try {
        const parsedData = JSON.parse(storedDataString);
        if (typeof parsedData.formData !== 'object' || parsedData.formData === null) {
            parsedData.formData = {};
        }
        setSummaryData(parsedData);
        if (parsedData.matter) {
            if (parsedData.matter.clientIds && parsedData.matter.clientIds.length > 0) {
                setPrimaryClientIdForRibbon(parsedData.matter.clientIds[0]);
            }
            setCurrentMatterType(parsedData.matter.type);
        } else if (parsedData.client) {
            setPrimaryClientIdForRibbon(parsedData.client.id);
            // Try to find matter type if matter isn't in summaryData but client is
            const clientMatter = MOCK_MATTERS_DATA.find(m => m.clientIds.includes(parsedData.client.id) && m.id === matterId);
            if (clientMatter) setCurrentMatterType(clientMatter.type);
        }

      } catch (error) {
        console.error("Error parsing summary data from sessionStorage:", error);
        toast({ title: "Error", description: "Could not load summary data.", variant: "destructive" });
        setSummaryData({ formData: {}, matter: null, client: null, formTitle: "Error Loading Data", docType: "unknown" });
      }
    } else {
        setSummaryData({ formData: {}, matter: null, client: null, formTitle: "No Data Available", docType: "unknown" });
        if(matterId){
            const currentMatter = MOCK_MATTERS_DATA.find(m => m.id === matterId);
            if(currentMatter){
                if(currentMatter.clientIds.length > 0) setPrimaryClientIdForRibbon(currentMatter.clientIds[0]);
                setCurrentMatterType(currentMatter.type);
            }
        }
    }
    setIsLoading(false);
  }, [matterId]);

  const handleSaveToMatter = () => {
    if (!summaryData || !summaryData.matter || !summaryData.client || !summaryData.matter.firmId) {
      toast({ title: "Error", description: "Cannot save summary. Critical data missing (matter, client, or firmId).", variant: "destructive" });
      return;
    }

    let summaryContent = `Summary for: ${summaryData.formTitle}\nClient: ${summaryData.client.name}`;
    if (summaryData.client2) {
        summaryContent += ` & ${summaryData.client2.name}`;
    }
    summaryContent += `\nMatter: ${summaryData.matter.name}\n\nForm Data:\n${JSON.stringify(summaryData.formData, null, 2)}`;

    const newDocument: DocType = {
      id: `doc-${Date.now()}`,
      name: `${summaryData.formTitle} - Summary.txt`,
      clientId: summaryData.client.id,
      matterId: summaryData.matter.id,
      type: "Form Summary",
      dateUploaded: new Date().toISOString().split('T')[0],
      size: "N/A",
      contentPreview: summaryContent.substring(0, 500) + (summaryContent.length > 500 ? "..." : ""),
      firmId: summaryData.matter.firmId,
    };

    MOCK_DOCUMENTS_DATA.unshift(newDocument);

    toast({ title: "Summary Saved", description: `${newDocument.name} has been added to matter documents.` });
    sessionStorage.removeItem('pendingFormSummaryData');
    router.push(`/attorney/documents?matterId=${summaryData.matter.id}`);
  };

  const handleBack = () => {
    router.push(`/attorney/matters/${matterId}/create-document?summary_action=done`);
  };

  if (isLoading) {
    return <div className="p-6 text-center">Loading summary...</div>;
  }

  if (!summaryData || !summaryData.formData) {
    return (
      <div className="p-6 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
        <p className="text-lg font-semibold">No Summary Data Found</p>
        <p className="text-sm text-muted-foreground">
          The form data for the summary could not be loaded. This might happen if you navigated here directly or if the session data was cleared.
        </p>
        <Button onClick={() => router.push(`/attorney/matters/${matterId}/create-document`)} variant="outline" className="mt-4">
          Back to Document Selection
        </Button>
      </div>
    );
  }

  const { formData, client, client2, formTitle: actualFormTitle } = summaryData;

  const PageIcon =
    docType === 'Trust' ? Home :
    docType === 'Will' ? FileText :
    docType === 'FiduciaryPackage' ? Users :
    CalendarCheck2;

  return (
    <div className="space-y-8 bg-background min-h-full -m-6 p-6">
       {matterId && summaryData.matter && (
         <MatterActionRibbon
            matterId={matterId}
            matterType={summaryData.matter.type}
            primaryClientId={primaryClientIdForRibbon}
            currentPathname={currentPathname}
          />
        )}
        <Card className="max-w-4xl mx-auto shadow-xl border border-primary/20">
        <CardHeader className="bg-primary/5 border-b border-primary/20">
            <div className="flex items-center space-x-3">
                <PageIcon className="w-8 h-8 text-primary" />
                <div>
                    <CardTitle className="text-2xl text-primary">{actualFormTitle}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                    Matter: {summaryData.matter?.name} | Client(s): {client?.name}
                    {client2 && ` & ${client2.name}`}
                    </p>
                </div>
            </div>
        </CardHeader>
        <CardContent className="space-y-6 p-4 sm:p-6">
            {docType === 'Trust' && summaryData.subType === 'Married Couple - Joint' ? (
            renderRltJointSummary(formData, client, client2)
            ) : (
            <>
                <Card className="bg-amber-50/50 border-amber-200 text-amber-800">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center"><AlertTriangle className="w-4 h-4 mr-2"/>Notice</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm">
                        A detailed, formatted summary view for this specific document type ('{docType}' - Subtype: '{summaryData.subType || 'N/A'}') is not yet fully implemented.
                        A raw data summary is shown below.
                        </p>
                    </CardContent>
                </Card>
                {renderGenericSummary(formData)}
            </>
            )}
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t bg-muted/30 p-4">
            <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Document Selection
            </Button>
            <Button onClick={handleSaveToMatter} className="bg-primary hover:bg-primary/90">
            <Save className="mr-2 h-4 w-4" /> Save Summary to Matter
            </Button>
        </CardFooter>
        </Card>
    </div>
  );
}
