// Coach declarations shown in the coach portal: three short statements the
// coach confirms before signing. The English text must stay identical to
// declaration_text (version 3) in db/011; the coach signs that code and
// version. Sinhala and Tamil are draft translations: SLA's legal and
// language reviewers must approve them before launch.

import type { Lang } from "./i18n";

export const DECLARATION_VERSION = 3;

export type Declaration = {
  code: string;
  allowsDisclosure: boolean;
  text: Record<Lang, { title: string; body: string }>;
};

export const DECLARATIONS: Declaration[] = [
  {
    code: "TRUE_AND_CONSENT",
    allowsDisclosure: false,
    text: {
      en: {
        title: "True information",
        body:
          "The information I have given is true. SLA may check it and keep it in the national register under the " +
          "Personal Data Protection Act No. 9 of 2022.",
      },
      si: {
        title: "සත්‍ය තොරතුරු",
        body:
          "මා ලබා දුන් තොරතුරු සත්‍ය වේ. 2022 අංක 9 දරන පුද්ගලික දත්ත ආරක්ෂණ පනත යටතේ SLA හට ඒවා පරීක්ෂා කර " +
          "ජාතික ලේඛනයේ තබා ගත හැකිය.",
      },
      ta: {
        title: "உண்மையான தகவல்",
        body:
          "நான் வழங்கிய தகவல்கள் உண்மையானவை. 2022 ஆம் ஆண்டின் 9 ஆம் இலக்க தனிப்பட்ட தரவுப் பாதுகாப்புச் சட்டத்தின் " +
          "கீழ் SLA அவற்றைச் சரிபார்த்து தேசியப் பதிவேட்டில் வைத்திருக்கலாம்.",
      },
    },
  },
  {
    code: "CLEAN_RECORD",
    allowsDisclosure: true,
    text: {
      en: {
        title: "Clean record",
        body:
          "I have no conviction for offences against children or for violence, and no current anti-doping ban. If " +
          "this is not true, choose \"I need to disclose\".",
      },
      si: {
        title: "පිරිසිදු වාර්තාව",
        body:
          "ළමයින්ට එරෙහි වැරදි හෝ ප්‍රචණ්ඩත්වය සම්බන්ධයෙන් මා වරදකරු කර නොමැති අතර, දැනට කිසිදු උත්තේජක තහනමක් ද " +
          "නොමැත. මෙය සත්‍ය නොවේ නම්, \"මට හෙළි කිරීමට ඇත\" තෝරන්න.",
      },
      ta: {
        title: "தூய்மையான பதிவு",
        body:
          "சிறுவர்களுக்கு எதிரான குற்றங்கள் அல்லது வன்முறைக்காக நான் தண்டிக்கப்படவில்லை, தற்போது எந்த ஊக்கமருந்துத் " +
          "தடையும் இல்லை. இது உண்மையல்ல எனில், \"நான் வெளிப்படுத்த வேண்டும்\" என்பதைத் தெரிவுசெய்யவும்.",
      },
    },
  },
  {
    code: "COACH_CODE",
    allowsDisclosure: false,
    text: {
      en: {
        title: "Coach code",
        body: "I will keep athletes safe, support clean sport and follow the SLA coach code.",
      },
      si: {
        title: "පුහුණුකරු චර්යා ධර්ම",
        body: "මම ක්‍රීඩකයින් ආරක්ෂිතව තබා ගනිමි, පිරිසිදු ක්‍රීඩාවට සහාය වෙමි, සහ SLA පුහුණුකරු චර්යා ධර්ම අනුගමනය කරමි.",
      },
      ta: {
        title: "பயிற்றுநர் நடத்தைக் கோவை",
        body:
          "வீரர்களைப் பாதுகாப்பாக வைத்திருப்பேன், தூய்மையான விளையாட்டுக்கு ஆதரவளிப்பேன், SLA பயிற்றுநர் நடத்தைக் " +
          "கோவையைப் பின்பற்றுவேன்.",
      },
    },
  },
];

export const DECLARATION_CODES = DECLARATIONS.map((d) => d.code);
