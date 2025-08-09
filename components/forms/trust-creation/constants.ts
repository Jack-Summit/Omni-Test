
// @ts-nocheck
// TODO: Remove ts-nocheck and fix types

// Based on user-provided constants and form structure

export const YES_NO_OPTIONS = [
    { value: 'Yes', label: 'Yes' },
    { value: 'No', label: 'No' },
];

export const GENDER_OPTIONS = [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
    { value: 'Non-binary', label: 'Non-binary' },
    { value: 'Other', label: 'Other' },
    { value: 'Prefer not to say', label: 'Prefer not to say' },
];

export const CHILD_RELATIONSHIP_OPTIONS = [
    { value: 'Biological', label: 'Biological Child' },
    { value: 'Adopted', label: 'Adopted Child' },
    { value: 'Stepchild', label: 'Stepchild' },
    { value: 'Other', label: 'Other' },
];

export const GIFT_KIND_OPTIONS = [
    { value: 'Cash', label: 'Cash' },
    { value: 'Jewelry', label: 'Jewelry' },
    { value: 'Personal Property', label: 'Personal Property' },
    { value: 'Real Estate', label: 'Real Estate' },
    { value: 'Securities', label: 'Securities' },
    { value: 'Other', label: 'Other (Describe)' },
];

export const GIFT_TIMING_OPTIONS = [
    { value: 'Death of Trustor 1', label: 'Death of Trustor 1' },
    { value: 'Death of Trustor 2', label: 'Death of Trustor 2' },
    { value: 'Death of Both Trustors', label: 'Death of Both Trustors' },
];

// For Wills, timing is simpler
export const WILL_GIFT_TIMING_OPTIONS = [
    { value: 'At Testator Death', label: 'At Testator\'s Death' },
];


export const GIFT_EXPENSE_BEARER_OPTIONS = [
    { value: 'Recipient Bears Expenses', label: 'Recipient Bears Expenses' },
    { value: 'Trust/Estate Bears Expenses', label: 'Trust/Estate Bears Expenses' },
];

export const GIFT_TAX_PAYER_OPTIONS = [
    { value: 'Estate', label: 'Estate' },
    { value: 'Recipient', label: 'Recipient' },
];

export const DISTRIBUTION_TYPE_OPTIONS = [
    { value: 'Standard Free of Trust', label: 'Standard Free of Trust' },
    { value: 'Access/Divorce Protection', label: 'Access/Divorce Protection Trust' },
    { value: 'Special Needs', label: 'Special Needs Trust' },
    { value: 'Sentry w/ Investment Trustee', label: 'Sentry Trust (with Investment Trustee)' },
    { value: 'Sentry w/o Investment Trustee', label: 'Sentry Trust (without Investment Trustee)' },
    { value: 'Terms Specified', label: 'Terms Specified (Ages/Staggered)' },
    { value: 'GST Income', label: 'GST - Income Only' },
    { value: 'GST TRU', label: 'GST - TRU (Total Return Unitrust)' },
    { value: 'GST Discretionary', label: 'GST - Discretionary' },
];

// Filtered options for Non-A/B Trusts
export const NON_AB_DISTRIBUTION_TYPE_OPTIONS = [
    { value: 'Standard Free of Trust', label: 'Standard Free of Trust' },
    { value: 'Special Needs Trust', label: 'Special Needs Trust' },
    { value: 'Terms Specified (Ages/Staggered)', label: 'Terms Specified (Ages/Staggered)' },
];


export const LAPSE_PROVISION_OPTIONS = [
    { value: 'Per Stirpes', label: 'Per Stirpes (to beneficiary\'s descendants)' },
    { value: 'Named Beneficiaries Immediate', label: 'Named Beneficiaries (Immediate Distribution)' },
    { value: 'To Issue If Any Otherwise To Siblings', label: 'To Issue, If Any, Otherwise To Siblings (Per Stirpes)'},
    { value: 'To Siblings If No Issue', label: 'To Siblings, If No Issue (Per Stirpes)'},
    { value: 'To Trustors Heirs', label: 'To Trustor\'s Heirs at Law'},
];

export const WILL_LAPSE_PROVISION_OPTIONS = [
    { value: 'Per Stirpes', label: 'Per Stirpes (to beneficiary\'s descendants)' },
    { value: 'Named Beneficiaries Immediate', label: 'Named Beneficiaries (Immediate Distribution)' },
    { value: 'To Issue If Any Otherwise To Siblings', label: 'To Issue, If Any, Otherwise To Siblings (Per Stirpes)'},
    { value: 'To Siblings If No Issue', label: 'To Siblings, If No Issue (Per Stirpes)'},
    { value: 'To Clients Heirs', label: 'To Client\'s Heirs at Law'},
];


export const NAMED_LAPSE_TIMING_OPTIONS = [
    { value: 'Immediate', label: 'Immediate Distribution' },
    { value: 'Hold In Trust', label: 'Hold In Trust (Per Original Terms)' },
];

export const TERMS_INCOME_OPTIONS = [
    { value: 'HEMS', label: 'HEMS (Health, Education, Maintenance, Support)' },
    { value: 'Mandatory', label: 'Mandatory Income to Beneficiary' },
    { value: 'Discretionary', label: 'Fully Discretionary by Trustee'},
];

export const TERMS_PRINCIPAL_OPTIONS = [
    { value: 'HEMS Only', label: 'HEMS Only (Health, Education, Maintenance, Support)' },
    { value: 'Age 1', label: 'Outright at Specified Age' },
    { value: 'Stagger 2', label: 'Staggered (2 Ages)' },
    { value: 'Stagger 3', label: 'Staggered (3 Ages)' },
    { value: 'Discretionary', label: 'Fully Discretionary by Trustee'},
];

export const TERMS_LAPSE_PROVISION_OPTIONS = [
    { value: 'Per Stirpes to Beneficiary\'s Issue', label: 'Per Stirpes to Beneficiary\'s Issue' },
    { value: 'To Siblings', label: 'To Beneficiary\'s Siblings (Per Stirpes)' },
    { value: 'To Trustors Heirs', label: 'To Trustor\'s Heirs at Law' },
];

export const GST_LAPSE_PROVISION_OPTIONS = [
    { value: 'Per Stirpes', label: 'Per Stirpes' },
    { value: 'Specific Beneficiary Descendants at Spec Age', label: 'Specific Beneficiary Descendants at Specified Age' },
    { value: 'Per Capita', label: 'Per Capita at Each Generation' },
];

export const SENTRY_INVEST_TRUSTEE_OPTIONS = [
    { value: 'Specific Beneficiary', label: 'Specific Beneficiary (as Investment Trustee)' },
    { value: 'Other', label: 'Other (Specify Investment Trustee Name)' },
    { value: 'None Appointed', label: 'None Appointed (Distribution Trustee Manages Investments)'},
];

export const BENEFICIARY_TRUSTEE_OPTIONS = [
    { value: 'Same as then Serving Successor', label: 'Same as then Serving Successor Trustee(s) of Main Trust' },
    { value: 'Beneficiary Only', label: 'Beneficiary Only (Once legal age/capacity)' },
    { value: '3rd Party', label: '3rd Party Trustee(s) (Specify Below)' },
    { value: 'Beneficiary and 3rd Party', label: 'Beneficiary and 3rd Party Co-Trustees' },
    { value: 'Beneficiary at Named Age', label: 'Beneficiary at Named Age (Specify Age)' },
];

export const SUCCESSOR_TRUSTEE_ROLE_OPTIONS = [
    { value: 'Individual', label: 'Individual' },
    { value: 'Corporate/Professional', label: 'Corporate/Professional Trustee' },
];

export const RELATIONSHIP_OPTIONS = [
    { value: 'Spouse', label: 'Spouse' },
    { value: 'Child', label: 'Child' },
    { value: 'Parent', label: 'Parent' },
    { value: 'Sibling', label: 'Sibling' },
    { value: 'Grandchild', label: 'Grandchild' },
    { value: 'Friend', label: 'Friend' },
    { value: 'Professional Advisor', label: 'Professional Advisor (CPA, Attorney, etc.)' },
    { value: 'Corporate Trustee', label: 'Corporate Trustee' },
    { value: 'Other Relative', label: 'Other Relative' },
    { value: 'Other', label: 'Other' },
    { value: 'Not Applicable', label: 'Not Applicable / None' },
];

export const TPP_DISTRIBUTION_OPTIONS = [ 
    { value: 'Equally to Children', label: 'Equally to Children' },
    { value: 'With Residual Estate', label: 'With Residual Estate' },
    { value: 'Equally to', label: 'Equally to (Specify Names):' }
];

export const COMMON_POT_OPTIONS = [
    {value: "No Common Pot Trust", label: "No Common Pot Trust"},
    {value: "Common Pot until Youngest Specified Age", label: "Common Pot Trust until Youngest Child Reaches Specified Age, then Separate Shares."},
    {value: "Common Pot until Youngest Specified Age or College", label: "Common Pot Trust until Earlier of Youngest Child Reaching Specified Age or Attaining College Degree, then Separate Shares."}
];

export const RETIREMENT_TRUST_TYPE_OPTIONS = [
    {value: "Conduit", label: "Conduit (Tax at Beneficiaries’ Individual Rate)"},
    {value: "Accumulation", label: "Accumulation (CAUTION: Tax at Trust Rate)"}
];

export const RETIREMENT_ACCUMULATION_DISTRIBUTION_METHOD_OPTIONS = [
    { value: "Indefinite", label: "Indefinite (Distribution at Trustee's Discretion)" },
    { value: "Until Specified Age", label: "Until Specified Age" }
];

export const OPTIONAL_POA_OPTIONS = [
    {value: "Yes, Each Beny", label: "Yes, each Beneficiary"},
    {value: "Yes, Except", label: "Yes, Except:"},
    {value: "No", label: "No"}
];

export const INCENTIVE_CLAUSE_OPTIONS = [
    { value: 'Residence', label: 'Residence' },
    { value: 'IRA max', label: 'IRA max' },
    { value: 'International Travel', label: 'International Travel' },
    { value: 'Entrepreneur', label: 'Entrepreneur' },
    { value: 'Childcare', label: 'Childcare' },
];


export const RESIDUAL_DISTRIBUTION_MAIN_OPTIONS = [
    {value: "Group", label: "Group Distribution Options (NOTE: Assumes ALL beneficiaries are children of the Trustors)"},
    {value: "Different Group", label: "Different Group Distributions for Trustor 1 and Trustor 2"},
    {value: "Terms", label: "Terms Set Forth (Different amounts/distributions for different beneficiaries)"}
];

export const GROUP_DISTRIBUTION_OPTIONS = [
    { value: 'Equal and Immediate', label: 'Equal and Immediate' },
    { value: 'Access/Divorce Protection Trust', label: 'Access/Divorce Protection Trust' },
    { value: 'Equal and Terms Specified', label: 'Equal and Terms Specified' },
    { value: 'GST Shares Income HEMS Remainder GC Spec Age', label: 'GST Shares Income HEMS Remainder GC Specified Age' },
    { value: 'GST Shares Disc HEMS Remainder GC Spec Age', label: 'GST Shares Discretionary HEMS Remainder GC Specified Age' },
    { value: 'GST Shares TRU Remainder GC Spec Age', label: 'GST Shares TRU Remainder GC Specified Age' },
    { value: 'GST Shares TRU Remainder GC 25/30/35', label: 'GST Shares TRU Remainder GC 25/30/35' },
    { value: 'Asset Protection Trust w/ Investment Trustee', label: 'Asset Protection Trust w/ Investment Trustee' },
    { value: 'GST Family Incentive Trust', label: 'GST Family Incentive Trust' },
];

// Filtered options for Non-A/B Trusts
export const NON_AB_GROUP_DISTRIBUTION_OPTIONS = [
    { value: 'Equal and Immediate', label: 'Equal and Immediate' },
    { value: 'Access/Divorce Protection Trust', label: 'Access/Divorce Protection Trust' },
    { value: 'Equal and Terms Specified', label: 'Equal and Terms Specified' },
];


export const RESIDUAL_GROUP_OPTIONS = [
    { value: 'Children Only', label: 'Children Only (and their issue per stirpes)' },
    { value: 'Descendants Per Stirpes', label: 'Descendants, Per Stirpes' },
    { value: 'Named Individuals', label: 'Named Individuals (Specify below, divided equally unless noted)' },
];

export const ULTIMATE_DISTRIBUTION_PATTERN_OPTIONS = [
    { value: 'Same', label: 'Same Ultimate Distribution' },
    { value: 'Different', label: 'Different Ultimate Distribution' }
];

export const ULTIMATE_SAME_OPTIONS = [
    { value: 'Same Intestate', label: 'According to State Intestacy Laws' },
    { value: 'Same Named Beneficiaries', label: 'To Named Beneficiaries Below' },
    { value: 'Trustor and Spouse Heirs', label: 'Split 50/50 between Trustor 1\'s Heirs and Trustor 2\'s Heirs (as defined by law)' }
];

export const ULTIMATE_T1_OPTIONS = [
    { value: 'Trustor One Intestate', label: 'To Trustor 1\'s Heirs (as defined by law)' },
    { value: 'Trustor One Named Beneficiaries', label: 'To Trustor 1\'s Named Beneficiaries Below' }
];

export const ULTIMATE_T2_OPTIONS = [
    { value: 'Trustor Two Intestate', label: 'To Trustor 2\'s Heirs (as defined by law)' },
    { value: 'Trustor Two Named Beneficiaries', label: 'To Trustor 2\'s Named Beneficiaries Below' }
];

export const ULTIMATE_BENEFICIARY_TYPE_OPTIONS = [
    { value: 'Individual', label: 'Individual' },
    { value: 'Charity', label: 'Charity' },
];


export const NO_CONTEST_OPTIONS_FORM = [
  { value: 'Insert', label: 'Insert No-Contest Clause' },
  { value: 'Do Not Insert', label: 'Do Not Insert No-Contest Clause (Not Recommended)' },
];

export const GUARDIAN_CHOICE_OPTIONS = [
    { value: 'Single', label: 'Single Guardian' },
    { value: 'Joint', label: 'Joint Guardians (Co-Guardians)' },
];

export const FINANCIAL_AGENT_CHOICE_OPTIONS = [
    { value: 'Single', label: 'Single Agent (Successors act one after another)' },
    { value: 'Joint initially, then several', label: 'Joint initially (must act together), then successors can act severally' },
    { value: 'Several', label: 'All named agents (and successors) can act severally (independently)' },
];

export const SUCCESSOR_TRUSTEE_ACTING_OPTIONS = [
    { value: 'Jointly', label: 'Must Act Jointly (if multiple serving)' },
    { value: 'Severally', label: 'May Act Severally (Independently, if multiple serving)' },
    { value: 'Majority', label: 'Majority Vote (if three or more serving)' },
];

// --- Constants for Advanced Provisions Tab ---
export const FUNDING_BENEFICIARY_OPTIONS = [
    {value: "Spouse first", label: "Spouse first"},
    {value: "Beneficiaries same as residual", label: "Beneficiaries same as residual"},
    {value: "Other", label: "Other:"}
];

export const ADV_PROV_DUTY_ACCOUNT_SUCCESSOR_OPTIONS = [
    {value: "Account", label: "Account"},
    {value: "Waive", label: "Waive"},
    {value: "Default UTC", label: "Default UTC"}
];

export const ADV_PROV_PROPERTY_AGREEMENT_OPTIONS = [
    {value: "Aggregate Theory CP", label: "Aggregate Theory Community Property Agreement - CALIFORNIA"},
    {value: "Convert JT to TIC", label: "Convert Joint Tenancy to Tenants-In-Common (Common Law or Community Property States)"},
    {value: "Convert JT and SP to CP", label: "Convert Both Joint Tenancy and Separate Property to Community Property (Community Property States)"},
    {value: "Convert JT and SP to TIC", label: "Convert Both Joint Tenancy and Separate Property to Tenants-in-Common (Common Law States)"},
    {value: "Convert JT to CP", label: "Convert Joint Tenancy to Community Property (Community Property States)"}
];

export const ADV_PROV_MAINTAIN_CP_OPTIONS = [
    {value: "Maintain CP status", label: "Maintain CP status"},
    {value: "Not Applicable", label: "Not Applicable"}
];

export const ADV_PROV_LIFE_INSURANCE_OPTIONS = [
    {value: "Allocate to Family Trust (Super Family Trust)", label: "Allocate life insurance insuring the surviving Trustor or another person (other than the Deceased Trustor) to the Family Trust in order to create a Super Family Trust."},
    {value: "Allocate to Family Trust (Fund Underfunded)", label: "Allocate death benefit of life insurance on the Deceased Trustor to the Family Trust in order to help fund an otherwise underfunded Family Trust."},
    {value: "Neither", label: "Neither."}
];

export const ADV_PROV_LIFETIME_RIGHTS_OPTIONS = [
    {value: "01", label: "Provide for Incapacitated Trustor only"},
    {value: "02", label: "Provide for Incapacitated Trustor first, and then Spouse"},
    {value: "03", label: "Provide for Incapacitated Trustor first, and then Spouse and Dependents"}
];

export const ADV_PROV_QTIP_RECOVERY_OPTIONS = [
    {value: "Do Not Waive", label: "Do Not Waive Recovery Rights (Select if beneficiaries of QTIP are different than Survivor’s Trust beneficiaries.)"},
    {value: "Waive Recovery Rights", label: "Waive Recovery Rights (Select if beneficiaries of the QTIP and Survivor’s Trusts are the same.)"}
];

export const ADV_PROV_TRUST_DIVISION_OPTIONS = [
    {value: "A/B Split", label: "A/B Split"},
    {value: "A/B/C Split (QTIP)", label: "A/B/C Split (QTIP)"}
];

export const ADV_PROV_AB_SPLIT_FORMULA_OPTIONS = [
    {value: "Pecuniary Family Trust", label: "Pecuniary Family Trust"},
    {value: "Fractional Division", label: "Fractional Division"},
    {value: "Pecuniary Survivor’s Trust", label: "Pecuniary Survivor’s Trust"},
    {value: "Disclaimer Trust", label: "Disclaimer Trust"},
    {value: "Small Estate", label: "Small Estate – If in Oregon – Always tie to State estate tax as well as Federal"},
    {value: "PLR 200101021", label: "PLR 200101021"}
];

export const ADV_PROV_ABC_SPLIT_FORMULA_OPTIONS = [
    {value: "Pecuniary Family Trust-QTIP", label: "Pecuniary Family Trust-QTIP"},
    {value: "Fractional Division/QTIP", label: "Fractional Division/QTIP"},
    {value: "Pecuniary Marital Trust/QTIP", label: "Pecuniary Marital Trust/QTIP"},
    {value: "Clayton Trust", label: "Clayton Trust"}
];

export const ADV_PROV_FAMILY_TRUST_ADMIN_OPTIONS = [
    { value: "PI5LPOA", label: "Principal, Income, 5%/$5,000, Limited Power of Appointment" },
    { value: "PI5", label: "Principal, Income, 5%/$5,000 (Option 1 - w/o LPOA)" },
    { value: "PI", label: "Principal, Income" },
    { value: "IncomeOnly", label: "Income Only" },
    { value: "PILPOA", label: "Principal, Income, Limited Power of Appointment (Same as 3 but with LPOA)" },
    { value: "DPT", label: "06 – Divorce Protection Trust / Family Access Trust for Spouse (HEMS only for spouse)" },
    { value: "TRU", label: "07 - Total Return Unitrust, Principal, Limited Power of Appointment" },
    { value: "APT", label: "08 - Asset Protection Trust / Family Sentry Trust for Spouse" },
    { value: "APTIT", label: "09 - Asset Protection Trust / Family Sentry Trust for Spouse w/ Investment Trustee" }
];

export const ADV_PROV_MARITAL_TRUST_ADMIN_OPTIONS = [
    { value: "DPTLPOA_MT", label: "Divorce Protection Trust / Family Access Trust for Spouse w/ LPOA" },
    { value: "DPTIT_MT", label: "Divorce Protection Trust / Family Access Trust for Spouse w/ Investment Trustee" },
    { value: "PI_MT", label: "Principal, Income" },
    { value: "IncomeLPOA_MT", label: "Income, Limited Power of Appointment" },
    { value: "APTS_MT", label: "Asset Protection Trust / Family Sentry Trust for Spouse" },
    { value: "APTIT_MT", label: "Asset Protection Trust / Family Sentry Trust for Spouse w/ Investment Trustee" },
    { value: "TRUPILPOA_MT", label: "Total Return Unitrust, Principal, Limited Power of Appointment" },
    { value: "TRUPI_MT", label: "Total Return Unitrust, Principal" }
];

// --- NEW Constants for Trust Details Tab (from user provided code) ---
export const TRUST_EXECUTION_TYPE_OPTIONS = [ 
    { value: 'New', label: 'New Trust Agreement' },
    { value: 'Restatement', label: 'Restatement of Existing Trust' },
];

export const TRUST_STATUS_OPTIONS = [
    {value: "New", label: "New"},
    {value: "Restatement", label: "Restatement"}
];

// Added this constant as it was missing
export const INVESTMENT_STANDARD_OPTIONS = [
    {value: "Prudent Investor", label: "Prudent Investor"},
    {value: "Prudent Person", label: "Prudent Person"}
];


export const JOINT_SUCCESSOR_TRUSTEE_OPTIONS = [
    {value: "05", label: "Standard: Both initial, healthy alone after first incapacity, then joint successor."},
    {value: "07", label: "Same as Standard but joint successor co-trustee with healthy trustor on their own trust, then joint successor."},
    {value: "08", label: "Multiple Initial Trustees, then joint successor Co-trustees."},
    {value: "09", label: "Multiple Initial Trustees, then joint solo successor trustee."}
];

export const SEPARATE_SUCCESSOR_TRUSTEE_OPTIONS = [
    {value: "01", label: "Healthy spouse solo of Living Trust, then co-trustee of Family Trust."},
    {value: "02", label: "Upon Incapacity of one trustor, healthy spouse will serve with a co-trustee with incapacitated trustor’s appointee of Living Trust."},
    {value: "03", label: "Healthy trustor co-trustee when first incapacitated, then sole of Survivor's."},
    {value: "04", label: "Upon Incapacity of one trustor, healthy spouse will serve with a co-trustee with incapacitated trustor’s appointee of Living Trust. Survivor has a veto power over any discretionary distributions by the Successor Trustee of the Family Trust"},
    {value: "06", label: "Separately named Successors for Survivor's and Family Trust after both pass."}
];


export const REMOVAL_CRITERIA_OPTIONS = [
    {value: "Majority in INTEREST", label: "Majority in INTEREST of beneficiaries for cause"},
    {value: "Majority in NUMBER", label: "Majority in NUMBER of beneficiaries for cause"}
];

export const INCAPACITY_CONSENT_OPTIONS = [
    { value: 'Unanimous Consent', label: 'Unanimous Consent' },
    { value: 'Majority Consent', label: 'Majority Consent' },
];


// --- NEW Constants for Will Forms ---
export const WILL_TPP_DISTRIBUTION_OPTIONS = [
    { value: 'Equally to Children', label: 'Equally to Children' },
    { value: 'With Residuary Estate', label: 'With Residuary Estate' },
    { value: 'Equally to:', label: 'Equally to: (Specify Names)' },
];

export const WILL_PERSONAL_REPRESENTATIVE_BOND_OPTIONS = [
    { value: 'Yes, waive bond requirement', label: 'Yes, waive bond requirement' },
    { value: 'No, require bond', label: 'No, require bond' },
];

export const WILL_SIMULTANEOUS_DEATH_OPTIONS = [
    { value: 'Spouse Presumed Survivor', label: 'Spouse is presumed to have survived Testator' },
    { value: 'Testator Presumed Survivor', label: 'Testator is presumed to have survived Spouse' },
    { value: 'Standard Statutory Presumption', label: 'Rely on standard statutory presumption (e.g., Uniform Simultaneous Death Act)' },
];


export const WILL_RESIDUARY_DISTRIBUTION_OPTIONS = [
    { value: 'All to surviving spouse. After death of both spouses, equal to children of the Testators (NOTE Group Options assume that ALL beneficiaries are joint children)', label: "All to surviving spouse. After death of both spouses, equal to children of the Testators (NOTE Group Options assume that ALL beneficiaries are joint children)" },
    { value: 'Different amounts/distributions for different beneficiaries.', label: "Different amounts/distributions for different beneficiaries." },
];


export const WILL_ULTIMATE_DISTRIBUTION_OPTIONS = [
    { value: 'Heirs at Law', label: 'To my heirs at law' },
    { value: 'To the following named individuals/charities:', label: 'To the following named individuals/charities:' }, 
];

export const PERSONAL_REPRESENTATIVE_APPOINTMENT_SOURCE_OPTIONS = (
    testatorLabel = "Testator", 
    spouseLabel = "Spouse"      
) => [
    { value: 'Specify Below', label: 'Specify Below' },
    { value: `Spouse_Of_${testatorLabel.replace(/\s+/g, '')}`, label: `Spouse (${spouseLabel})`}, 
    { value: `${testatorLabel.replace(/\s+/g, '')}_FA1`, label: `${testatorLabel}'s Financial Agent 1` },
    { value: `${testatorLabel.replace(/\s+/g, '')}_FA2`, label: `${testatorLabel}'s Financial Agent 2` },
    { value: `${testatorLabel.replace(/\s+/g, '')}_FA3`, label: `${testatorLabel}'s Financial Agent 3` },
];


export const PERSONAL_REPRESENTATIVE_ROLE_OPTIONS = [
    { value: 'Individual', label: 'Individual' },
    { value: 'Corporate Personal Representative', label: 'Corporate Personal Representative' },
];

export const PERSONAL_REPRESENTATIVE_ACTING_OPTIONS = [
    { value: 'Singly', label: 'Act Singly (if multiple named, they act one after another)' },
    { value: 'Jointly', label: 'Must Act Jointly (if multiple named, they must act together)' },
    { value: 'Severally', label: 'May Act Severally (if multiple named, any can act independently)' },
    { value: 'Majority Vote', label: 'Majority Vote (if three or more serving and applicable)' },
];

// Added for Will (Single Individual) residual distribution choice
export const WILL_SINGLE_RESIDUAL_OPTIONS = [
    { value: 'EquallyToChildren', label: 'Equally to Children' },
    { value: 'SpecifyShares', label: 'Specify Residual Beneficiary Shares' }
];
    
export const DISPOSITION_AGENT_SOURCE_OPTIONS = [
    { value: 'Same as Financial POA', label: 'Same as Financial POA' },
    { value: 'Same as Health POA', label: 'Same as Health POA' },
    { value: 'Other', label: 'Other (Specify Below)' },
];
    
export const SUCCESSOR_TRUSTEE_OPTIONS = [
    { value: 'Same as Financial Agents', label: 'Same as Financial Agents (if specified above)' },
    { value: 'Specify Different', label: 'Specify Different Successor Trustees' },
];

// INDIVIDUAL_OPTIONS_YN is effectively YES_NO_OPTIONS, so not adding it separately.
// export const INDIVIDUAL_OPTIONS_YN = YES_NO_OPTIONS;
// Ensure all other previously defined constants are present

export const PROPERTY_SHARES_OPTIONS = [
    {value: "Equal Shares", label: "Equal Shares"},
    {value: "Unequal Shares", label: "Unequal Shares"},
    {value: "All separate", label: "All separate"}
];
// ... any other constants ...


