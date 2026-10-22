// Text for the public portal: navigation, home page, the athlete/coach
// choice, and the coach registration form. English is the source; Sinhala
// and Tamil are drafts for SLA's language reviewers. TypeScript requires
// every key in all three languages.

export const portalEn = {
  // header and navigation
  navHome: "Home",
  navRegister: "Register",
  navVerify: "Check an SLA ID",
  langSwitchLabel: "Language / භාෂාව / மொழி",
  skipToContent: "Skip to content",

  // home page
  homeEyebrow: "Sri Lanka Athletics · National Register",
  homeHeroTitle: "One SLA ID for every athlete and coach",
  homeHeroIntro:
    "Register once and keep your SLA ID for life. Athletes and coaches each have their own registration, " +
    "in English, Sinhala or Tamil.",
  homeAthleteCta: "I am an Athlete",
  homeAthleteCtaText: "Compete in athletics? Register your events, personal bests and coaches.",
  homeCoachCta: "I am a Coach",
  homeCoachCtaText: "Coach athletes? Register your qualifications and get your coach SLA ID.",
  statsAthletes: "Registered athletes",
  statsCoaches: "Registered coaches",
  statsDistricts: "Districts represented",
  homeLangTitle: "Your language, on every page",
  homeLangText:
    "Every page, form and message is available in English, Sinhala and Tamil. Change language at any time " +
    "from the top of the page. Your answers are kept.",
  homeVerifyTitle: "Check an SLA ID",
  homeVerifyText: "See whether an SLA ID is valid and verified. Only the masked name and district are shown.",
  homeSeparateTitle: "Separate forms for athletes and coaches",
  homeSeparateText:
    "Athletes and coaches never share a form. Children registering as athletes are never shown coach " +
    "declarations, and coach details are checked by SLA before they are approved.",
  homeCoachHow1: "Check your NIC",
  homeCoachHow2: "Add your qualifications and certificates",
  homeCoachHow3: "Sign the SLA coach declarations and get your coach SLA ID",
  homeAthleteHow1: "Check your NIC or Postal ID",
  homeAthleteHow2: "Add your events, personal bests and coaches",
  homeAthleteHow3: "Get your athlete SLA ID straight away",
  homeForAthletes: "For athletes",
  homeForCoaches: "For coaches",

  // register: athlete or coach
  chooseTitle: "How are you registering?",
  chooseIntro:
    "Athletes and coaches register separately, each with their own form. Choose the one that describes you.",
  chooseAthleteTitle: "Athlete",
  chooseAthlete1: "Your events and personal bests",
  chooseAthlete2: "Your current and past coaches",
  chooseAthlete3: "Parent or guardian details if you are under 18",
  chooseCoachTitle: "Coach",
  chooseCoach1: "Your coaching qualifications and certificates",
  chooseCoach2: "Your certificates and an optional photo",
  chooseCoach3: "SLA safeguarding and clean-sport declarations",
  chooseCoachAdult: "Coaches must be 18 or older.",
  chooseStart: "Start",
  chooseTime: "About {n} minutes",
  chooseBoth:
    "Both an athlete and a coach? Register in one of them. One person keeps one SLA ID, so SLA will add " +
    "the other role to the same ID.",
  portalAthlete: "Athlete registration",
  portalCoach: "Coach registration",
  switchPortal: "Not an athlete? Register as a coach",
  switchPortalCoach: "Not a coach? Register as an athlete",

  // identity check, per role
  checkIntroCoach:
    "We first check that you are not already registered. Each person gets one SLA ID for life.",
  alreadyHasCoachRole:
    "This SLA ID belongs to a coach record. You do not need a second ID: contact SLA to add an athlete " +
    "profile to it.",

  // coach form
  coachFormTitle: "Coach details",
  coachFormIntro:
    "About 10 minutes. Have your coaching certificates ready as a PDF or photo. Your answers stay on this " +
    "device until you finish, even if you change language.",
  secProfessional: "Professional details",
  phoneCoach: "Mobile number",
  email: "Email address",
  emailHint: "Optional. Used only by SLA to contact you.",
  licenceNo: "SLA coaching licence number",
  licenceNoHint: "If you already have one",
  licenceLevel: "Licence level",
  licenceLevelHint: "e.g. Level 2, National Coach",
  disciplinesTitle: "Events you coach",
  disciplinesHint: "Choose every event you coach. Pick at least one.",
  disciplinesCount: "{n} selected",

  secQualifications: "Qualifications and certificates",
  qualDesc:
    "Add up to 10 coaching qualifications, such as World Athletics CECS levels, SLA courses or a sport " +
    "science degree. Attach a photo or PDF of each certificate if you can.",
  qualN: "Qualification {n}",
  qualLevel: "Qualification",
  qualLevelOther: "Name of the qualification",
  qualEventGroup: "Event group",
  qualEventGroupAny: "All / not specific",
  qualIssuer: "Issued by",
  qualIssuerHint: "e.g. World Athletics, Sri Lanka Athletics, University of Colombo",
  qualSerial: "Certificate number",
  qualYear: "Year awarded",
  qualFile: "Certificate file",
  qualFileHint: "PDF, JPG or PNG, up to 3 MB",
  qualUpload: "Attach certificate",
  qualUploading: "Uploading…",
  qualUploaded: "Attached",
  qualRemoveFile: "Remove file",
  addQualification: "Add a qualification",
  noQualifications: "No qualifications yet. You can still register: SLA will contact you about your qualifications.",
  levelCECS_L1_YOUTH: "World Athletics CECS Level I (Youth coach)",
  levelCECS_L2_EVENT: "World Athletics CECS Level II (Event group coach)",
  levelCECS_L3_ELITE: "World Athletics CECS Level III (Elite coach)",
  levelSLAA_NATIONAL: "SLA National Coach certificate",
  levelUNIVERSITY_SPORT_SCI: "University degree in sport science or physical education",
  levelOTHER: "Other qualification",


  secDeclarations: "Declarations and code of conduct",
  declarationsDesc:
    "Read each statement. Confirm it, or choose \u201cI need to disclose\u201d if it is not true for you. " +
    "Disclosures are confidential and reviewed only by SLA.",
  declConfirm: "I confirm",
  declDisclose: "I need to disclose",
  declDetails: "Give details (confidential)",
  declAnswered: "{n} of {total} answered",
  signatureTitle: "Your signature",
  signatureLabel: "Type your full name to sign",
  signatureHint: "It must match your full name exactly: {name}",
  signatureMatches: "Signature matches your full name.",

  navProfessional: "Professional",
  navQualifications: "Qualifications",
  navDeclarations: "Declarations",
  coachSubmit: "Register and get my coach SLA ID",

  // done page, coach
  cardCoach: "Coach",
  doneCoachKeep:
    "Your coach registration has been sent to Sri Lanka Athletics. SLA will review your qualifications " +
    "and contact you to verify your details.",
  next2Coach: "SLA will check your certificates and call you to confirm your details.",
  next3Coach: "SLA checks your certificates with the body that issued them and may call you.",

  // public SLA ID check
  verifyTitle: "Check an SLA ID",
  verifyIntro:
    "Enter an SLA ID to see whether it is valid. To protect privacy, only the masked name, district and " +
    "role are shown.",
  verifyLabel: "SLA ID",
  verifyPlaceholder: "e.g. SL26-000452-8",
  verifyButton: "Check",
  verifyInvalid: "This is not a valid SLA ID. Check the letters and digits, including the last digit.",
  verifyNotFound: "No member has this SLA ID.",
  verifyFound: "This SLA ID is registered",
  verifyStatus_verified: "Verified by SLA",
  verifyStatus_pending: "Registered, waiting for SLA verification",
  verifyStatus_suspended: "Not active",
  verifyRoleAthlete: "Athlete",
  verifyRoleCoach: "Coach",
  verifyTooMany: "Too many checks. Please wait a minute and try again.",

  // athlete-first home, coach portal
  navAthleteReg: "Athlete registration",
  navCoachPortal: "Coach portal",
  navMenu: "Menu",
  heroTitle: "Your athletics journey starts with one SLA ID",
  heroIntro: "Register as an athlete in about 5 minutes and keep your SLA ID for life: for championships, official results and national selection.",
  heroCta: "Register as an athlete",
  heroCtaNote: "Free · About 5 minutes · Your SLA ID straight away",
  coachNoteText: "Are you a coach? Coaches register separately.",
  coachNoteLink: "Go to the SLA Coach Portal",
  athleteHowTitle: "Three steps to your SLA ID",
  portalAthleteTagline: "For sprinters, jumpers, throwers, walkers and distance runners of every age.",
  portalCoachBadge: "SLA Coach Portal",
  portalCoachTagline: "For qualified coaches aged 18 and over. Every coach is reviewed by SLA.",
  coachChipQual: "Qualifications",
  coachChipSafe: "Safeguarding",
  coachChipClean: "Clean sport",
  coachWatermark: "COACH",
  coachCredential: "Coach credential application",
  coachStep: "Step {n}",
  coachPledge: "I sign as a coach registering with Sri Lanka Athletics.",
  coachSignedOn: "Date: {date}",
  coachHomeTitle: "Register as an SLA coach",
  coachHomeIntro: "Coaches shape Sri Lanka's athletes. Register your qualifications, confirm three short statements, and receive your coach SLA ID.",
  coachHomeCta: "Start coach registration",
  coachHomeCtaNote: "About 10 minutes · Reviewed by SLA",
  coachNeedTitle: "Have these ready",
  coachNeed1: "Your NIC",
  coachNeed2: "Your coaching certificates, as a PDF or a clear photo",
  coachNeed3: "A clear photo of your face (optional)",
  coachNeed4: "You must be 18 or older",
  coachHowTitle: "How coach registration works",
  coachHow4: "SLA reviews your certificates and calls you to confirm",
  coachCodeTitle: "The SLA coach code",
  coachCode1Title: "Safeguarding first",
  coachCode1: "Protecting young athletes comes before everything else.",
  coachCode2: "Every coach commits to the anti-doping rules.",
  coachCode3Title: "Checked credentials",
  coachCode3: "Qualifications are confirmed with the body that issued them.",
};

export type PortalKey = keyof typeof portalEn;
type PortalMessages = Record<PortalKey, string>;

export const portalSi: PortalMessages = {
  navHome: "මුල් පිටුව",
  navRegister: "ලියාපදිංචිය",
  navVerify: "SLA අංකයක් පරීක්ෂා කරන්න",
  langSwitchLabel: "Language / භාෂාව / மொழி",
  skipToContent: "අන්තර්ගතයට යන්න",

  homeEyebrow: "ශ්‍රී ලංකා මලල ක්‍රීඩා · ජාතික ලේඛනය",
  homeHeroTitle: "සෑම ක්‍රීඩකයෙකුටම සහ පුහුණුකරුවෙකුටම එක් SLA අංකයක්",
  homeHeroIntro:
    "එක් වරක් ලියාපදිංචි වී ඔබේ SLA අංකය ජීවිත කාලයටම තබා ගන්න. ක්‍රීඩකයින්ට සහ පුහුණුකරුවන්ට වෙන වෙනම " +
    "ලියාපදිංචි පෝරම ඇත; ඉංග්‍රීසි, සිංහල හෝ දෙමළ භාෂාවෙන්.",
  homeAthleteCta: "මම ක්‍රීඩකයෙක්",
  homeAthleteCtaText: "මලල ක්‍රීඩා තරග සඳහා සහභාගී වෙනවාද? ඔබේ ඉසව්, හොඳම දක්ෂතා සහ පුහුණුකරුවන් ලියාපදිංචි කරන්න.",
  homeCoachCta: "මම පුහුණුකරුවෙක්",
  homeCoachCtaText: "ක්‍රීඩකයින් පුහුණු කරනවාද? ඔබේ සුදුසුකම් ලියාපදිංචි කර ඔබේ පුහුණුකරු SLA අංකය ලබා ගන්න.",
  statsAthletes: "ලියාපදිංචි ක්‍රීඩකයින්",
  statsCoaches: "ලියාපදිංචි පුහුණුකරුවන්",
  statsDistricts: "නියෝජිත දිස්ත්‍රික්ක",
  homeLangTitle: "සෑම පිටුවකම ඔබේ භාෂාව",
  homeLangText:
    "සෑම පිටුවක්ම, පෝරමයක්ම සහ පණිවිඩයක්ම ඉංග්‍රීසි, සිංහල සහ දෙමළ භාෂාවලින් ලබා ගත හැක. පිටුවේ ඉහළින් " +
    "ඕනෑම වේලාවක භාෂාව වෙනස් කරන්න. ඔබේ පිළිතුරු රැඳී පවතී.",
  homeVerifyTitle: "SLA අංකයක් පරීක්ෂා කරන්න",
  homeVerifyText: "SLA අංකයක් වලංගු සහ තහවුරු කර ඇත්දැයි බලන්න. පෙන්වන්නේ ආවරණය කළ නම සහ දිස්ත්‍රික්කය පමණි.",
  homeSeparateTitle: "ක්‍රීඩකයින්ට සහ පුහුණුකරුවන්ට වෙනම පෝරම",
  homeSeparateText:
    "ක්‍රීඩකයින් සහ පුහුණුකරුවන් කිසිවිටෙක එකම පෝරමය භාවිත නොකරයි. ක්‍රීඩකයින් ලෙස ලියාපදිංචි වන දරුවන්ට " +
    "පුහුණුකරු ප්‍රකාශන නොපෙන්වන අතර, පුහුණුකරුවන්ගේ තොරතුරු අනුමත කිරීමට පෙර SLA විසින් පරීක්ෂා කරනු ලැබේ.",
  homeCoachHow1: "ඔබේ ජාතික හැඳුනුම්පත පරීක්ෂා කරන්න",
  homeCoachHow2: "ඔබේ සුදුසුකම් සහ සහතික එක් කරන්න",
  homeCoachHow3: "SLA පුහුණුකරු ප්‍රකාශනවලට අත්සන් කර ඔබේ පුහුණුකරු SLA අංකය ලබා ගන්න",
  homeAthleteHow1: "ඔබේ ජාතික හැඳුනුම්පත හෝ තැපැල් හැඳුනුම්පත පරීක්ෂා කරන්න",
  homeAthleteHow2: "ඔබේ ඉසව්, හොඳම දක්ෂතා සහ පුහුණුකරුවන් එක් කරන්න",
  homeAthleteHow3: "ඔබේ ක්‍රීඩක SLA අංකය වහාම ලබා ගන්න",
  homeForAthletes: "ක්‍රීඩකයින් සඳහා",
  homeForCoaches: "පුහුණුකරුවන් සඳහා",

  chooseTitle: "ඔබ ලියාපදිංචි වන්නේ කෙසේද?",
  chooseIntro:
    "ක්‍රීඩකයින් සහ පුහුණුකරුවන් තම තමන්ගේම පෝරම මඟින් වෙන වෙනම ලියාපදිංචි වේ. ඔබට ගැළපෙන එක තෝරන්න.",
  chooseAthleteTitle: "ක්‍රීඩකයා",
  chooseAthlete1: "ඔබේ ඉසව් සහ පුද්ගලික හොඳම දක්ෂතා",
  chooseAthlete2: "ඔබේ වත්මන් සහ පෙර පුහුණුකරුවන්",
  chooseAthlete3: "ඔබ වයස 18ට අඩු නම් දෙමාපියන්ගේ හෝ භාරකරුගේ තොරතුරු",
  chooseCoachTitle: "පුහුණුකරු",
  chooseCoach1: "ඔබේ පුහුණු සුදුසුකම් සහ සහතික",
  chooseCoach2: "ඔබේ සහතික සහ අවශ්‍ය නම් ඡායාරූපයක්",
  chooseCoach3: "SLA ළමා ආරක්ෂණ සහ පිරිසිදු ක්‍රීඩා ප්‍රකාශන",
  chooseCoachAdult: "පුහුණුකරුවන් වයස අවුරුදු 18 හෝ ඊට වැඩි විය යුතුය.",
  chooseStart: "අරඹන්න",
  chooseTime: "මිනිත්තු {n}ක් පමණ",
  chooseBoth:
    "ඔබ ක්‍රීඩකයෙක් මෙන්ම පුහුණුකරුවෙක්ද? එකකින් ලියාපදිංචි වන්න. එක් පුද්ගලයෙකුට ඇත්තේ එක් SLA අංකයක් " +
    "පමණක් බැවින්, අනෙක් භූමිකාව SLA විසින් එම අංකයටම එක් කරනු ඇත.",
  portalAthlete: "ක්‍රීඩක ලියාපදිංචිය",
  portalCoach: "පුහුණුකරු ලියාපදිංචිය",
  switchPortal: "ඔබ ක්‍රීඩකයෙක් නොවේද? පුහුණුකරුවෙකු ලෙස ලියාපදිංචි වන්න",
  switchPortalCoach: "ඔබ පුහුණුකරුවෙක් නොවේද? ක්‍රීඩකයෙකු ලෙස ලියාපදිංචි වන්න",

  checkIntroCoach:
    "ඔබ දැනටමත් ලියාපදිංචි වී නොමැති බව අපි මුලින්ම පරීක්ෂා කරමු. සෑම අයෙකුටම ජීවිත කාලයටම එක් SLA අංකයක් ලැබේ.",
  alreadyHasCoachRole:
    "මෙම SLA අංකය පුහුණුකරු වාර්තාවකට අයත් වේ. ඔබට දෙවන අංකයක් අවශ්‍ය නැත: ක්‍රීඩක පැතිකඩක් එයට එක් කිරීමට " +
    "SLA අමතන්න.",

  coachFormTitle: "පුහුණුකරුගේ තොරතුරු",
  coachFormIntro:
    "මිනිත්තු 10ක් පමණ. ඔබේ පුහුණු සහතික PDF හෝ ඡායාරූප ලෙස සූදානම් කර තබා ගන්න. ඔබ අවසන් කරන තෙක්, " +
    "භාෂාව වෙනස් කළත්, ඔබේ පිළිතුරු මෙම උපාංගයේ රැඳී පවතී.",
  secProfessional: "වෘත්තීය තොරතුරු",
  phoneCoach: "ජංගම දුරකථන අංකය",
  email: "ඊමේල් ලිපිනය",
  emailHint: "විකල්පයි. ඔබව ඇමතීමට SLA පමණක් භාවිත කරයි.",
  licenceNo: "SLA පුහුණු බලපත්‍ර අංකය",
  licenceNoHint: "ඔබට දැනටමත් එකක් ඇත්නම්",
  licenceLevel: "බලපත්‍ර මට්ටම",
  licenceLevelHint: "උදා: 2 වන මට්ටම, ජාතික පුහුණුකරු",
  disciplinesTitle: "ඔබ පුහුණු කරන ඉසව්",
  disciplinesHint: "ඔබ පුහුණු කරන සියලු ඉසව් තෝරන්න. අවම වශයෙන් එකක් තෝරන්න.",
  disciplinesCount: "{n}ක් තෝරා ඇත",

  secQualifications: "සුදුසුකම් සහ සහතික",
  qualDesc:
    "World Athletics CECS මට්ටම්, SLA පාඨමාලා හෝ ක්‍රීඩා විද්‍යා උපාධියක් වැනි පුහුණු සුදුසුකම් 10ක් දක්වා " +
    "එක් කරන්න. හැකි නම් එක් එක් සහතිකයේ ඡායාරූපයක් හෝ PDF එකක් අමුණන්න.",
  qualN: "සුදුසුකම {n}",
  qualLevel: "සුදුසුකම",
  qualLevelOther: "සුදුසුකමේ නම",
  qualEventGroup: "ඉසව් කාණ්ඩය",
  qualEventGroupAny: "සියල්ල / විශේෂිත නොවේ",
  qualIssuer: "නිකුත් කළේ",
  qualIssuerHint: "උදා: World Athletics, ශ්‍රී ලංකා මලල ක්‍රීඩා, කොළඹ විශ්වවිද්‍යාලය",
  qualSerial: "සහතික අංකය",
  qualYear: "ප්‍රදානය කළ වර්ෂය",
  qualFile: "සහතික ගොනුව",
  qualFileHint: "PDF, JPG හෝ PNG, උපරිම 3 MB",
  qualUpload: "සහතිකය අමුණන්න",
  qualUploading: "උඩුගත කරමින්…",
  qualUploaded: "අමුණා ඇත",
  qualRemoveFile: "ගොනුව ඉවත් කරන්න",
  addQualification: "සුදුසුකමක් එක් කරන්න",
  noQualifications: "තවම සුදුසුකම් නැත. ඔබට තවමත් ලියාපදිංචි විය හැක: ඔබේ සුදුසුකම් ගැන SLA ඔබව අමතනු ඇත.",
  levelCECS_L1_YOUTH: "World Athletics CECS 1 වන මට්ටම (යෞවන පුහුණුකරු)",
  levelCECS_L2_EVENT: "World Athletics CECS 2 වන මට්ටම (ඉසව් කාණ්ඩ පුහුණුකරු)",
  levelCECS_L3_ELITE: "World Athletics CECS 3 වන මට්ටම (ප්‍රභූ පුහුණුකරු)",
  levelSLAA_NATIONAL: "SLA ජාතික පුහුණුකරු සහතිකය",
  levelUNIVERSITY_SPORT_SCI: "ක්‍රීඩා විද්‍යාව හෝ ශාරීරික අධ්‍යාපනය පිළිබඳ විශ්වවිද්‍යාල උපාධිය",
  levelOTHER: "වෙනත් සුදුසුකමක්",


  secDeclarations: "ප්‍රකාශන සහ චර්යා ධර්ම සංග්‍රහය",
  declarationsDesc:
    "එක් එක් ප්‍රකාශය කියවන්න. එය තහවුරු කරන්න, නැතහොත් එය ඔබට සත්‍ය නොවේ නම් \u201cමට හෙළි කිරීමට ඇත\u201d " +
    "තෝරන්න. හෙළි කිරීම් රහසිගත වන අතර SLA විසින් පමණක් සමාලෝචනය කෙරේ.",
  declConfirm: "මම තහවුරු කරමි",
  declDisclose: "මට හෙළි කිරීමට ඇත",
  declDetails: "විස්තර දෙන්න (රහසිගතයි)",
  declAnswered: "{total}න් {n}කට පිළිතුරු දී ඇත",
  signatureTitle: "ඔබේ අත්සන",
  signatureLabel: "අත්සන් කිරීමට ඔබේ සම්පූර්ණ නම ටයිප් කරන්න",
  signatureHint: "එය ඔබේ සම්පූර්ණ නමට හරියටම ගැළපිය යුතුය: {name}",
  signatureMatches: "අත්සන ඔබේ සම්පූර්ණ නමට ගැළපේ.",

  navProfessional: "වෘත්තීය",
  navQualifications: "සුදුසුකම්",
  navDeclarations: "ප්‍රකාශන",
  coachSubmit: "ලියාපදිංචි වී මගේ පුහුණුකරු SLA අංකය ලබා ගන්න",

  cardCoach: "පුහුණුකරු",
  doneCoachKeep:
    "ඔබේ පුහුණුකරු ලියාපදිංචිය ශ්‍රී ලංකා මලල ක්‍රීඩා වෙත යවන ලදී. SLA ඔබේ සුදුසුකම් සමාලෝචනය කර ඔබේ තොරතුරු " +
    "තහවුරු කිරීමට ඔබව අමතනු ඇත.",
  next2Coach: "SLA ඔබේ සහතික පරීක්ෂා කර ඔබේ තොරතුරු තහවුරු කිරීමට ඔබව අමතනු ඇත.",
  next3Coach: "SLA ඔබේ සහතික ඒවා නිකුත් කළ ආයතනය සමඟ පරීක්ෂා කරන අතර ඔබව ඇමතිය හැක.",

  verifyTitle: "SLA අංකයක් පරීක්ෂා කරන්න",
  verifyIntro:
    "SLA අංකයක් වලංගුදැයි බැලීමට එය ඇතුළත් කරන්න. පෞද්ගලිකත්වය ආරක්ෂා කිරීම සඳහා පෙන්වන්නේ ආවරණය කළ නම, " +
    "දිස්ත්‍රික්කය සහ භූමිකාව පමණි.",
  verifyLabel: "SLA අංකය",
  verifyPlaceholder: "උදා: SL26-000452-8",
  verifyButton: "පරීක්ෂා කරන්න",
  verifyInvalid: "මෙය වලංගු SLA අංකයක් නොවේ. අවසාන ඉලක්කම ද ඇතුළුව අකුරු සහ ඉලක්කම් පරීක්ෂා කරන්න.",
  verifyNotFound: "මෙම SLA අංකය සහිත සාමාජිකයෙකු නැත.",
  verifyFound: "මෙම SLA අංකය ලියාපදිංචි කර ඇත",
  verifyStatus_verified: "SLA විසින් තහවුරු කර ඇත",
  verifyStatus_pending: "ලියාපදිංචි කර ඇත, SLA තහවුරු කිරීම බලාපොරොත්තුවෙන්",
  verifyStatus_suspended: "සක්‍රිය නැත",
  verifyRoleAthlete: "ක්‍රීඩකයා",
  verifyRoleCoach: "පුහුණුකරු",
  verifyTooMany: "පරීක්ෂා කිරීම් වැඩියි. මිනිත්තුවක් රැඳී සිට නැවත උත්සාහ කරන්න.",

  // athlete-first home, coach portal
  navAthleteReg: "ක්‍රීඩක ලියාපදිංචිය",
  navCoachPortal: "පුහුණුකරු ද්වාරය",
  navMenu: "මෙනුව",
  heroTitle: "ඔබේ මලල ක්‍රීඩා ගමන එක් SLA අංකයකින් අරඹන්න",
  heroIntro: "මිනිත්තු 5කින් පමණ ක්‍රීඩකයෙකු ලෙස ලියාපදිංචි වී ජීවිත කාලය පුරාම ඔබේ SLA අංකය තබා ගන්න: ශූරතා, නිල ප්‍රතිඵල සහ ජාතික තේරීම් සඳහා.",
  heroCta: "ක්‍රීඩකයෙකු ලෙස ලියාපදිංචි වන්න",
  heroCtaNote: "නොමිලේ · මිනිත්තු 5ක් පමණ · SLA අංකය වහාම",
  coachNoteText: "ඔබ පුහුණුකරුවෙක්ද? පුහුණුකරුවන් වෙනම ලියාපදිංචි වේ.",
  coachNoteLink: "SLA පුහුණුකරු ද්වාරයට යන්න",
  athleteHowTitle: "ඔබේ SLA අංකයට පියවර තුනක්",
  portalAthleteTagline: "සෑම වයසකම කෙටි දුර, පැනීම්, විසිකිරීම්, ඇවිදීම සහ දිගු දුර ක්‍රීඩකයින් සඳහා.",
  portalCoachBadge: "SLA පුහුණුකරු ද්වාරය",
  portalCoachTagline: "වයස 18 සහ ඊට වැඩි සුදුසුකම් ලත් පුහුණුකරුවන් සඳහා. සෑම පුහුණුකරුවෙකුම SLA විසින් සමාලෝචනය කරයි.",
  coachChipQual: "සුදුසුකම්",
  coachChipSafe: "ආරක්ෂණය",
  coachChipClean: "පිරිසිදු ක්‍රීඩාව",
  coachWatermark: "පුහුණුකරු",
  coachCredential: "පුහුණුකරු අක්තපත්‍ර අයදුම්පත",
  coachStep: "පියවර {n}",
  coachPledge: "ශ්‍රී ලංකා මලල ක්‍රීඩා සමඟ ලියාපදිංචි වන පුහුණුකරුවෙකු ලෙස මම අත්සන් කරමි.",
  coachSignedOn: "දිනය: {date}",
  coachHomeTitle: "SLA පුහුණුකරුවෙකු ලෙස ලියාපදිංචි වන්න",
  coachHomeIntro: "පුහුණුකරුවන් ශ්‍රී ලංකාවේ ක්‍රීඩකයින් හැඩගස්වයි. ඔබේ සුදුසුකම් ලියාපදිංචි කර, කෙටි ප්‍රකාශ තුනක් තහවුරු කර, ඔබේ පුහුණුකරු SLA අංකය ලබා ගන්න.",
  coachHomeCta: "පුහුණුකරු ලියාපදිංචිය අරඹන්න",
  coachHomeCtaNote: "මිනිත්තු 10ක් පමණ · SLA විසින් සමාලෝචනය කරයි",
  coachNeedTitle: "මේවා සූදානම් කර තබා ගන්න",
  coachNeed1: "ඔබේ ජාතික හැඳුනුම්පත",
  coachNeed2: "ඔබේ පුහුණු සහතික, PDF හෝ පැහැදිලි ඡායාරූපයක් ලෙස",
  coachNeed3: "ඔබේ මුහුණේ පැහැදිලි ඡායාරූපයක් (අත්‍යවශ්‍ය නොවේ)",
  coachNeed4: "ඔබට වයස අවුරුදු 18 හෝ ඊට වැඩි විය යුතුය",
  coachHowTitle: "පුහුණුකරු ලියාපදිංචිය ක්‍රියා කරන ආකාරය",
  coachHow4: "SLA ඔබේ සහතික සමාලෝචනය කර තහවුරු කිරීමට ඔබව අමතයි",
  coachCodeTitle: "SLA පුහුණුකරු සංග්‍රහය",
  coachCode1Title: "ආරක්ෂණය මුලින්ම",
  coachCode1: "තරුණ ක්‍රීඩකයින් ආරක්ෂා කිරීම අන් සියල්ලටම වඩා වැදගත් ය.",
  coachCode2: "සෑම පුහුණුකරුවෙකුම උත්තේජක විරෝධී නීතිවලට කැප වේ.",
  coachCode3Title: "පරීක්ෂා කළ සුදුසුකම්",
  coachCode3: "සුදුසුකම් ඒවා නිකුත් කළ ආයතනය සමඟ තහවුරු කෙරේ.",
};

export const portalTa: PortalMessages = {
  navHome: "முகப்பு",
  navRegister: "பதிவு",
  navVerify: "SLA இலக்கத்தைச் சரிபார்க்க",
  langSwitchLabel: "Language / භාෂාව / மொழி",
  skipToContent: "உள்ளடக்கத்துக்குச் செல்லவும்",

  homeEyebrow: "இலங்கை மெய்வல்லுநர் · தேசிய பதிவேடு",
  homeHeroTitle: "ஒவ்வொரு வீரருக்கும் பயிற்றுநருக்கும் ஒரே SLA இலக்கம்",
  homeHeroIntro:
    "ஒருமுறை பதிவுசெய்து உங்கள் SLA இலக்கத்தை வாழ்நாள் முழுவதும் வைத்திருங்கள். வீரர்களுக்கும் பயிற்றுநர்களுக்கும் " +
    "தனித்தனி பதிவுப் படிவங்கள் உள்ளன; ஆங்கிலம், சிங்களம் அல்லது தமிழில்.",
  homeAthleteCta: "நான் ஒரு வீரர்",
  homeAthleteCtaText: "மெய்வல்லுநர் போட்டிகளில் பங்கேற்கிறீர்களா? உங்கள் போட்டி நிகழ்வுகள், சிறந்த பெறுபேறுகள் மற்றும் பயிற்றுநர்களைப் பதிவுசெய்யுங்கள்.",
  homeCoachCta: "நான் ஒரு பயிற்றுநர்",
  homeCoachCtaText: "வீரர்களுக்குப் பயிற்சி அளிக்கிறீர்களா? உங்கள் தகைமைகளைப் பதிவுசெய்து பயிற்றுநர் SLA இலக்கத்தைப் பெறுங்கள்.",
  statsAthletes: "பதிவுசெய்த வீரர்கள்",
  statsCoaches: "பதிவுசெய்த பயிற்றுநர்கள்",
  statsDistricts: "பிரதிநிதித்துவப்படுத்தப்படும் மாவட்டங்கள்",
  homeLangTitle: "ஒவ்வொரு பக்கத்திலும் உங்கள் மொழி",
  homeLangText:
    "ஒவ்வொரு பக்கமும் படிவமும் செய்தியும் ஆங்கிலம், சிங்களம் மற்றும் தமிழில் கிடைக்கும். பக்கத்தின் மேலே " +
    "எப்போது வேண்டுமானாலும் மொழியை மாற்றலாம். உங்கள் பதில்கள் பாதுகாக்கப்படும்.",
  homeVerifyTitle: "SLA இலக்கத்தைச் சரிபார்க்க",
  homeVerifyText: "ஒரு SLA இலக்கம் செல்லுபடியானதா, உறுதிப்படுத்தப்பட்டதா எனப் பாருங்கள். மறைக்கப்பட்ட பெயரும் மாவட்டமும் மட்டுமே காட்டப்படும்.",
  homeSeparateTitle: "வீரர்களுக்கும் பயிற்றுநர்களுக்கும் தனித்தனி படிவங்கள்",
  homeSeparateText:
    "வீரர்களும் பயிற்றுநர்களும் ஒருபோதும் ஒரே படிவத்தைப் பயன்படுத்துவதில்லை. வீரர்களாகப் பதிவுசெய்யும் " +
    "சிறுவர்களுக்குப் பயிற்றுநர் உறுதிமொழிகள் காட்டப்படாது; பயிற்றுநர் விவரங்கள் அங்கீகரிக்கப்படும் முன் SLA ஆல் சரிபார்க்கப்படும்.",
  homeCoachHow1: "உங்கள் தேசிய அடையாள அட்டையைச் சரிபார்க்கவும்",
  homeCoachHow2: "உங்கள் தகைமைகள் மற்றும் சான்றிதழ்களைச் சேர்க்கவும்",
  homeCoachHow3: "SLA பயிற்றுநர் உறுதிமொழிகளில் கையொப்பமிட்டு உங்கள் பயிற்றுநர் SLA இலக்கத்தைப் பெறுங்கள்",
  homeAthleteHow1: "உங்கள் தேசிய அடையாள அட்டை அல்லது அஞ்சல் அடையாள அட்டையைச் சரிபார்க்கவும்",
  homeAthleteHow2: "உங்கள் போட்டி நிகழ்வுகள், சிறந்த பெறுபேறுகள் மற்றும் பயிற்றுநர்களைச் சேர்க்கவும்",
  homeAthleteHow3: "உங்கள் வீரர் SLA இலக்கத்தை உடனடியாகப் பெறுங்கள்",
  homeForAthletes: "வீரர்களுக்கு",
  homeForCoaches: "பயிற்றுநர்களுக்கு",

  chooseTitle: "நீங்கள் எவ்வாறு பதிவுசெய்கிறீர்கள்?",
  chooseIntro:
    "வீரர்களும் பயிற்றுநர்களும் தங்களுக்கென உள்ள படிவங்கள் மூலம் தனித்தனியாகப் பதிவுசெய்வார்கள். உங்களுக்குப் பொருந்துவதைத் தெரிவுசெய்யுங்கள்.",
  chooseAthleteTitle: "வீரர்",
  chooseAthlete1: "உங்கள் போட்டி நிகழ்வுகளும் தனிப்பட்ட சிறந்த பெறுபேறுகளும்",
  chooseAthlete2: "உங்கள் தற்போதைய மற்றும் முன்னைய பயிற்றுநர்கள்",
  chooseAthlete3: "நீங்கள் 18 வயதுக்குக் குறைவானவர் எனில் பெற்றோர் அல்லது பாதுகாவலர் விவரங்கள்",
  chooseCoachTitle: "பயிற்றுநர்",
  chooseCoach1: "உங்கள் பயிற்றுநர் தகைமைகளும் சான்றிதழ்களும்",
  chooseCoach2: "உங்கள் சான்றிதழ்கள் மற்றும் விருப்பமான படம்",
  chooseCoach3: "SLA பாதுகாப்பு மற்றும் தூய்மையான விளையாட்டு உறுதிமொழிகள்",
  chooseCoachAdult: "பயிற்றுநர்கள் 18 வயது அல்லது அதற்கு மேற்பட்டவர்களாக இருக்க வேண்டும்.",
  chooseStart: "தொடங்கவும்",
  chooseTime: "சுமார் {n} நிமிடங்கள்",
  chooseBoth:
    "நீங்கள் வீரரும் பயிற்றுநரும் ஆவீர்களா? ஒன்றில் பதிவுசெய்யுங்கள். ஒருவருக்கு ஒரே SLA இலக்கம் மட்டுமே " +
    "என்பதால், மற்றைய பங்கை SLA அதே இலக்கத்தில் சேர்க்கும்.",
  portalAthlete: "வீரர் பதிவு",
  portalCoach: "பயிற்றுநர் பதிவு",
  switchPortal: "நீங்கள் வீரர் இல்லையா? பயிற்றுநராகப் பதிவுசெய்யுங்கள்",
  switchPortalCoach: "நீங்கள் பயிற்றுநர் இல்லையா? வீரராகப் பதிவுசெய்யுங்கள்",

  checkIntroCoach:
    "நீங்கள் ஏற்கனவே பதிவுசெய்யவில்லை என்பதை முதலில் சரிபார்க்கிறோம். ஒவ்வொருவருக்கும் வாழ்நாள் முழுவதற்கும் ஒரே SLA இலக்கம் வழங்கப்படும்.",
  alreadyHasCoachRole:
    "இந்த SLA இலக்கம் ஒரு பயிற்றுநர் பதிவுக்குரியது. உங்களுக்கு இரண்டாவது இலக்கம் தேவையில்லை: வீரர் விவரத்தை " +
    "அதில் சேர்க்க SLA ஐத் தொடர்புகொள்ளுங்கள்.",

  coachFormTitle: "பயிற்றுநர் விவரங்கள்",
  coachFormIntro:
    "சுமார் 10 நிமிடங்கள். உங்கள் பயிற்றுநர் சான்றிதழ்களை PDF அல்லது புகைப்படமாகத் தயாராக வைத்திருங்கள். " +
    "நீங்கள் முடிக்கும் வரை, மொழியை மாற்றினாலும், உங்கள் பதில்கள் இந்தச் சாதனத்தில் இருக்கும்.",
  secProfessional: "தொழில்சார் விவரங்கள்",
  phoneCoach: "கைபேசி இலக்கம்",
  email: "மின்னஞ்சல் முகவரி",
  emailHint: "விருப்பத்தேர்வு. உங்களைத் தொடர்புகொள்ள SLA மட்டுமே பயன்படுத்தும்.",
  licenceNo: "SLA பயிற்றுநர் அனுமதிப்பத்திர இலக்கம்",
  licenceNoHint: "ஏற்கனவே இருந்தால்",
  licenceLevel: "அனுமதிப்பத்திர நிலை",
  licenceLevelHint: "உ.ம்: நிலை 2, தேசிய பயிற்றுநர்",
  disciplinesTitle: "நீங்கள் பயிற்றுவிக்கும் நிகழ்வுகள்",
  disciplinesHint: "நீங்கள் பயிற்றுவிக்கும் எல்லா நிகழ்வுகளையும் தெரிவுசெய்யுங்கள். குறைந்தது ஒன்றைத் தெரிவுசெய்யுங்கள்.",
  disciplinesCount: "{n} தெரிவுசெய்யப்பட்டன",

  secQualifications: "தகைமைகளும் சான்றிதழ்களும்",
  qualDesc:
    "World Athletics CECS நிலைகள், SLA பாடநெறிகள் அல்லது விளையாட்டு விஞ்ஞானப் பட்டம் போன்ற 10 பயிற்றுநர் " +
    "தகைமைகள் வரை சேர்க்கவும். முடிந்தால் ஒவ்வொரு சான்றிதழின் புகைப்படம் அல்லது PDF ஐ இணைக்கவும்.",
  qualN: "தகைமை {n}",
  qualLevel: "தகைமை",
  qualLevelOther: "தகைமையின் பெயர்",
  qualEventGroup: "நிகழ்வுக் குழு",
  qualEventGroupAny: "அனைத்தும் / குறிப்பிட்டதல்ல",
  qualIssuer: "வழங்கியது",
  qualIssuerHint: "உ.ம்: World Athletics, இலங்கை மெய்வல்லுநர், கொழும்புப் பல்கலைக்கழகம்",
  qualSerial: "சான்றிதழ் இலக்கம்",
  qualYear: "வழங்கப்பட்ட ஆண்டு",
  qualFile: "சான்றிதழ் கோப்பு",
  qualFileHint: "PDF, JPG அல்லது PNG, அதிகபட்சம் 3 MB",
  qualUpload: "சான்றிதழை இணைக்கவும்",
  qualUploading: "பதிவேற்றுகிறது…",
  qualUploaded: "இணைக்கப்பட்டது",
  qualRemoveFile: "கோப்பை நீக்கவும்",
  addQualification: "ஒரு தகைமையைச் சேர்க்கவும்",
  noQualifications: "இன்னும் தகைமைகள் இல்லை. நீங்கள் பதிவுசெய்யலாம்: உங்கள் தகைமைகள் குறித்து SLA உங்களைத் தொடர்புகொள்ளும்.",
  levelCECS_L1_YOUTH: "World Athletics CECS நிலை I (இளையோர் பயிற்றுநர்)",
  levelCECS_L2_EVENT: "World Athletics CECS நிலை II (நிகழ்வுக் குழுப் பயிற்றுநர்)",
  levelCECS_L3_ELITE: "World Athletics CECS நிலை III (உயர்நிலைப் பயிற்றுநர்)",
  levelSLAA_NATIONAL: "SLA தேசிய பயிற்றுநர் சான்றிதழ்",
  levelUNIVERSITY_SPORT_SCI: "விளையாட்டு விஞ்ஞானம் அல்லது உடற்கல்வியில் பல்கலைக்கழகப் பட்டம்",
  levelOTHER: "வேறு தகைமை",


  secDeclarations: "உறுதிமொழிகளும் நடத்தைக் கோவையும்",
  declarationsDesc:
    "ஒவ்வொரு கூற்றையும் வாசியுங்கள். அதை உறுதிப்படுத்துங்கள், அல்லது அது உங்களுக்கு உண்மையல்ல எனில் " +
    "\u201cநான் வெளிப்படுத்த வேண்டும்\u201d என்பதைத் தெரிவுசெய்யுங்கள். வெளிப்படுத்தல்கள் இரகசியமானவை; SLA மட்டுமே மீளாய்வு செய்யும்.",
  declConfirm: "நான் உறுதிப்படுத்துகிறேன்",
  declDisclose: "நான் வெளிப்படுத்த வேண்டும்",
  declDetails: "விவரங்களைத் தரவும் (இரகசியம்)",
  declAnswered: "{total} இல் {n} பதிலளிக்கப்பட்டன",
  signatureTitle: "உங்கள் கையொப்பம்",
  signatureLabel: "கையொப்பமிட உங்கள் முழுப் பெயரைத் தட்டச்சு செய்யவும்",
  signatureHint: "இது உங்கள் முழுப் பெயருடன் சரியாகப் பொருந்த வேண்டும்: {name}",
  signatureMatches: "கையொப்பம் உங்கள் முழுப் பெயருடன் பொருந்துகிறது.",

  navProfessional: "தொழில்சார்",
  navQualifications: "தகைமைகள்",
  navDeclarations: "உறுதிமொழிகள்",
  coachSubmit: "பதிவுசெய்து எனது பயிற்றுநர் SLA இலக்கத்தைப் பெறுக",

  cardCoach: "பயிற்றுநர்",
  doneCoachKeep:
    "உங்கள் பயிற்றுநர் பதிவு இலங்கை மெய்வல்லுநருக்கு அனுப்பப்பட்டது. SLA உங்கள் தகைமைகளை மீளாய்வு செய்து, " +
    "உங்கள் விவரங்களை உறுதிப்படுத்த உங்களைத் தொடர்புகொள்ளும்.",
  next2Coach: "SLA உங்கள் சான்றிதழ்களைச் சரிபார்த்து, உங்கள் விவரங்களை உறுதிப்படுத்த உங்களை அழைக்கும்.",
  next3Coach: "SLA உங்கள் சான்றிதழ்களை வழங்கிய அமைப்புடன் சரிபார்த்து உங்களை அழைக்கலாம்.",

  verifyTitle: "SLA இலக்கத்தைச் சரிபார்க்க",
  verifyIntro:
    "ஒரு SLA இலக்கம் செல்லுபடியானதா எனப் பார்க்க அதை உள்ளிடுங்கள். தனியுரிமையைப் பாதுகாக்க, மறைக்கப்பட்ட பெயர், " +
    "மாவட்டம் மற்றும் பங்கு மட்டுமே காட்டப்படும்.",
  verifyLabel: "SLA இலக்கம்",
  verifyPlaceholder: "உ.ம்: SL26-000452-8",
  verifyButton: "சரிபார்க்கவும்",
  verifyInvalid: "இது செல்லுபடியான SLA இலக்கம் அல்ல. கடைசி இலக்கம் உட்பட எழுத்துகளையும் இலக்கங்களையும் சரிபார்க்கவும்.",
  verifyNotFound: "இந்த SLA இலக்கத்துடன் எந்த உறுப்பினரும் இல்லை.",
  verifyFound: "இந்த SLA இலக்கம் பதிவுசெய்யப்பட்டுள்ளது",
  verifyStatus_verified: "SLA ஆல் உறுதிப்படுத்தப்பட்டது",
  verifyStatus_pending: "பதிவுசெய்யப்பட்டது, SLA உறுதிப்படுத்தலுக்காகக் காத்திருக்கிறது",
  verifyStatus_suspended: "செயலில் இல்லை",
  verifyRoleAthlete: "வீரர்",
  verifyRoleCoach: "பயிற்றுநர்",
  verifyTooMany: "அதிகமான சரிபார்ப்புகள். ஒரு நிமிடம் காத்திருந்து மீண்டும் முயற்சிக்கவும்.",

  // athlete-first home, coach portal
  navAthleteReg: "வீரர் பதிவு",
  navCoachPortal: "பயிற்றுநர் தளம்",
  navMenu: "பட்டியல்",
  heroTitle: "உங்கள் மெய்வல்லுநர் பயணம் ஒரு SLA இலக்கத்துடன் தொடங்குகிறது",
  heroIntro: "சுமார் 5 நிமிடங்களில் வீரராகப் பதிவுசெய்து, உங்கள் SLA இலக்கத்தை வாழ்நாள் முழுவதும் வைத்திருங்கள்: போட்டிகள், உத்தியோகபூர்வ முடிவுகள் மற்றும் தேசியத் தெரிவுகளுக்கு.",
  heroCta: "வீரராகப் பதிவுசெய்யுங்கள்",
  heroCtaNote: "இலவசம் · சுமார் 5 நிமிடங்கள் · SLA இலக்கம் உடனே",
  coachNoteText: "நீங்கள் பயிற்றுநரா? பயிற்றுநர்கள் தனியாகப் பதிவுசெய்கிறார்கள்.",
  coachNoteLink: "SLA பயிற்றுநர் தளத்திற்குச் செல்லுங்கள்",
  athleteHowTitle: "உங்கள் SLA இலக்கத்திற்கு மூன்று படிகள்",
  portalAthleteTagline: "அனைத்து வயதினரான ஓட்ட, தாண்டல், எறிதல், நடை மற்றும் நீண்ட தூர வீரர்களுக்கு.",
  portalCoachBadge: "SLA பயிற்றுநர் தளம்",
  portalCoachTagline: "18 வயதும் அதற்கு மேற்பட்ட தகுதியான பயிற்றுநர்களுக்கு. ஒவ்வொரு பயிற்றுநரையும் SLA மதிப்பாய்வு செய்கிறது.",
  coachChipQual: "தகுதிகள்",
  coachChipSafe: "பாதுகாப்பு",
  coachChipClean: "தூய விளையாட்டு",
  coachWatermark: "பயிற்றுநர்",
  coachCredential: "பயிற்றுநர் அங்கீகார விண்ணப்பம்",
  coachStep: "படி {n}",
  coachPledge: "இலங்கை மெய்வல்லுநரில் பதிவுசெய்யும் பயிற்றுநராக நான் கையொப்பமிடுகிறேன்.",
  coachSignedOn: "திகதி: {date}",
  coachHomeTitle: "SLA பயிற்றுநராகப் பதிவுசெய்யுங்கள்",
  coachHomeIntro: "பயிற்றுநர்கள் இலங்கையின் வீரர்களை உருவாக்குகிறார்கள். உங்கள் தகுதிகளைப் பதிவுசெய்து, மூன்று சிறிய உறுதிமொழிகளை உறுதிப்படுத்தி, உங்கள் பயிற்றுநர் SLA இலக்கத்தைப் பெறுங்கள்.",
  coachHomeCta: "பயிற்றுநர் பதிவைத் தொடங்குங்கள்",
  coachHomeCtaNote: "சுமார் 10 நிமிடங்கள் · SLA மதிப்பாய்வு",
  coachNeedTitle: "இவற்றைத் தயாராக வைத்திருங்கள்",
  coachNeed1: "உங்கள் தேசிய அடையாள அட்டை",
  coachNeed2: "உங்கள் பயிற்சிச் சான்றிதழ்கள், PDF அல்லது தெளிவான புகைப்படமாக",
  coachNeed3: "உங்கள் முகத்தின் தெளிவான படம் (விருப்பத்தேர்வு)",
  coachNeed4: "நீங்கள் 18 வயது அல்லது அதற்கு மேற்பட்டவராக இருக்க வேண்டும்",
  coachHowTitle: "பயிற்றுநர் பதிவு எவ்வாறு செயல்படுகிறது",
  coachHow4: "SLA உங்கள் சான்றிதழ்களை மதிப்பாய்வு செய்து உறுதிப்படுத்த உங்களை அழைக்கும்",
  coachCodeTitle: "SLA பயிற்றுநர் நெறிமுறை",
  coachCode1Title: "பாதுகாப்பு முதலில்",
  coachCode1: "இளம் வீரர்களைப் பாதுகாப்பதே அனைத்திற்கும் முதன்மையானது.",
  coachCode2: "ஒவ்வொரு பயிற்றுநரும் ஊக்கமருந்து எதிர்ப்பு விதிகளுக்குக் கட்டுப்படுகிறார்.",
  coachCode3Title: "சரிபார்க்கப்பட்ட தகுதிகள்",
  coachCode3: "தகுதிகள் அவற்றை வழங்கிய அமைப்புடன் உறுதிப்படுத்தப்படும்.",
};

// Validation and server messages added for the coach portal, translated by
// their exact English text (see tErr).
export const portalErrorsSi: Record<string, string> = {
  "Coaches must be 18 or older.": "පුහුණුකරුවන් වයස අවුරුදු 18 හෝ ඊට වැඩි විය යුතුය.",
  "Coaches register with their NIC.": "පුහුණුකරුවන් ජාතික හැඳුනුම්පත සමඟ ලියාපදිංචි වේ.",
  "The signature must match your full name exactly.": "අත්සන ඔබේ සම්පූර්ණ නමට හරියටම ගැළපිය යුතුය.",
  "Please answer every declaration.": "කරුණාකර සියලු ප්‍රකාශනවලට පිළිතුරු දෙන්න.",
  "Give details for each disclosure.": "එක් එක් හෙළි කිරීම සඳහා විස්තර දෙන්න.",
  "This statement cannot be disclosed; please confirm it or contact SLA.":
    "මෙම ප්‍රකාශය හෙළි කළ නොහැක; කරුණාකර එය තහවුරු කරන්න නැතහොත් SLA අමතන්න.",
  "Choose at least one event you coach.": "ඔබ පුහුණු කරන අවම වශයෙන් එක් ඉසව්වක් තෝරන්න.",
  "Up to 10 qualifications.": "උපරිම සුදුසුකම් 10 කි.",
  "Up to 30 athletes.": "උපරිම ක්‍රීඩකයින් 30 දෙනෙකි.",
  "Select a qualification.": "සුදුසුකමක් තෝරන්න.",
  "Issued by is required.": "නිකුත් කළ ආයතනය අවශ්‍යයි.",
  "Issued by is too long.": "නිකුත් කළ ආයතනයේ නම දිග වැඩියි.",
  "Name of the qualification is required.": "සුදුසුකමේ නම අවශ්‍යයි.",
  "Certificate number is too long.": "සහතික අංකය දිග වැඩියි.",
  "Enter the year awarded.": "ප්‍රදානය කළ වර්ෂය ඇතුළත් කරන්න.",
  "Athlete name is required.": "ක්‍රීඩකයාගේ නම අවශ්‍යයි.",
  "Athlete name is too long.": "ක්‍රීඩකයාගේ නම දිග වැඩියි.",
  "Invalid athlete SLA ID.": "වලංගු නොවන ක්‍රීඩක SLA අංකයකි.",
  "Enter a valid email address.": "වලංගු ඊමේල් ලිපිනයක් ඇතුළත් කරන්න.",
  "The file must be a PDF, JPG or PNG.": "ගොනුව PDF, JPG හෝ PNG විය යුතුය.",
  "The file is larger than 3 MB.": "ගොනුව 3 MB ට වඩා විශාලයි.",
  "A certificate file could not be found. Please attach it again.":
    "සහතික ගොනුවක් සොයාගත නොහැකි විය. කරුණාකර එය නැවත අමුණන්න.",
  "This certificate number is already registered.": "මෙම සහතික අංකය දැනටමත් ලියාපදිංචි කර ඇත.",
  "This SLA licence number is already registered to another coach.":
    "මෙම SLA බලපත්‍ර අංකය දැනටමත් වෙනත් පුහුණුකරුවෙකුට ලියාපදිංචි කර ඇත.",
  "The same athlete is listed twice.": "එකම ක්‍රීඩකයා දෙවරක් සඳහන් කර ඇත.",
  "Only an athlete you coach now can have you as main coach.":
    "ඔබව ප්‍රධාන පුහුණුකරු ලෙස සිටිය හැක්කේ ඔබ දැනට පුහුණු කරන ක්‍රීඩකයෙකුට පමණි.",
  "A current athlete has no end year.": "වත්මන් ක්‍රීඩකයෙකුට අවසන් වර්ෂයක් නැත.",
  "Mobile number is required.": "ජංගම දුරකථන අංකය අවශ්‍යයි.",
  "Could not reach the server. Check your connection and try again.":
    "සේවාදායකය වෙත ළඟා විය නොහැක. ඔබේ සම්බන්ධතාවය පරීක්ෂා කර නැවත උත්සාහ කරන්න.",
};

export const portalErrorsTa: Record<string, string> = {
  "Coaches must be 18 or older.": "பயிற்றுநர்கள் 18 வயது அல்லது அதற்கு மேற்பட்டவர்களாக இருக்க வேண்டும்.",
  "Coaches register with their NIC.": "பயிற்றுநர்கள் தேசிய அடையாள அட்டையுடன் பதிவுசெய்ய வேண்டும்.",
  "The signature must match your full name exactly.": "கையொப்பம் உங்கள் முழுப் பெயருடன் சரியாகப் பொருந்த வேண்டும்.",
  "Please answer every declaration.": "தயவுசெய்து எல்லா உறுதிமொழிகளுக்கும் பதிலளிக்கவும்.",
  "Give details for each disclosure.": "ஒவ்வொரு வெளிப்படுத்தலுக்கும் விவரங்களைத் தரவும்.",
  "This statement cannot be disclosed; please confirm it or contact SLA.":
    "இந்தக் கூற்றை வெளிப்படுத்த முடியாது; தயவுசெய்து அதை உறுதிப்படுத்தவும் அல்லது SLA ஐத் தொடர்புகொள்ளவும்.",
  "Choose at least one event you coach.": "நீங்கள் பயிற்றுவிக்கும் குறைந்தது ஒரு நிகழ்வைத் தெரிவுசெய்யவும்.",
  "Up to 10 qualifications.": "அதிகபட்சம் 10 தகைமைகள்.",
  "Up to 30 athletes.": "அதிகபட்சம் 30 வீரர்கள்.",
  "Select a qualification.": "ஒரு தகைமையைத் தெரிவுசெய்யவும்.",
  "Issued by is required.": "வழங்கிய நிறுவனம் தேவை.",
  "Issued by is too long.": "வழங்கிய நிறுவனத்தின் பெயர் மிக நீளமானது.",
  "Name of the qualification is required.": "தகைமையின் பெயர் தேவை.",
  "Certificate number is too long.": "சான்றிதழ் இலக்கம் மிக நீளமானது.",
  "Enter the year awarded.": "வழங்கப்பட்ட ஆண்டை உள்ளிடவும்.",
  "Athlete name is required.": "வீரரின் பெயர் தேவை.",
  "Athlete name is too long.": "வீரரின் பெயர் மிக நீளமானது.",
  "Invalid athlete SLA ID.": "செல்லுபடியற்ற வீரர் SLA இலக்கம்.",
  "Enter a valid email address.": "செல்லுபடியான மின்னஞ்சல் முகவரியை உள்ளிடவும்.",
  "The file must be a PDF, JPG or PNG.": "கோப்பு PDF, JPG அல்லது PNG ஆக இருக்க வேண்டும்.",
  "The file is larger than 3 MB.": "கோப்பு 3 MB ஐ விடப் பெரியது.",
  "A certificate file could not be found. Please attach it again.":
    "ஒரு சான்றிதழ் கோப்பைக் கண்டறிய முடியவில்லை. தயவுசெய்து மீண்டும் இணைக்கவும்.",
  "This certificate number is already registered.": "இந்தச் சான்றிதழ் இலக்கம் ஏற்கனவே பதிவுசெய்யப்பட்டுள்ளது.",
  "This SLA licence number is already registered to another coach.":
    "இந்த SLA அனுமதிப்பத்திர இலக்கம் ஏற்கனவே வேறொரு பயிற்றுநருக்குப் பதிவுசெய்யப்பட்டுள்ளது.",
  "The same athlete is listed twice.": "ஒரே வீரர் இருமுறை குறிப்பிடப்பட்டுள்ளார்.",
  "Only an athlete you coach now can have you as main coach.":
    "நீங்கள் தற்போது பயிற்றுவிக்கும் வீரருக்கு மட்டுமே நீங்கள் பிரதான பயிற்றுநராக இருக்கலாம்.",
  "A current athlete has no end year.": "தற்போதைய வீரருக்கு முடிவு ஆண்டு இல்லை.",
  "Mobile number is required.": "கைபேசி இலக்கம் தேவை.",
  "Could not reach the server. Check your connection and try again.":
    "சேவையகத்தை அணுக முடியவில்லை. உங்கள் இணைப்பைச் சரிபார்த்து மீண்டும் முயற்சிக்கவும்.",
};
