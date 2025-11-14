<?php

namespace App\Enums;

enum LanguageType: string
{
    case af = 'af';
    case sq = 'sq';
    case sm = 'sm';
    case ar = 'ar';
    case hy = 'hy';
    case az = 'az';
    case eu = 'eu';
    case be = 'be';
    case bn = 'bn';
    case bh = 'bh';
    case bs = 'bs';
    case bg = 'bg';
    case ca = 'ca';
    case hr = 'hr';
    case cs = 'cs';
    case da = 'da';
    case nl = 'nl';
    case en = 'en';
    case eo = 'eo';
    case et = 'et';
    case fo = 'fo';
    case tl = 'tl';
    case fi = 'fi';
    case fr = 'fr';
    case fy = 'fy';
    case gl = 'gl';
    case ka = 'ka';
    case de = 'de';
    case el = 'el';
    case gu = 'gu';
    case iw = 'iw';
    case hi = 'hi';
    case hu = 'hu';
    case is = 'is';
    case id = 'id';
    case ia = 'ia';
    case ga = 'ga';
    case it = 'it';
    case ja = 'ja';
    case jw = 'jw';
    case kn = 'kn';
    case ko = 'ko';
    case la = 'la';
    case lv = 'lv';
    case lt = 'lt';
    case mk = 'mk';
    case ms = 'ms';
    case ml = 'ml';
    case mt = 'mt';
    case mr = 'mr';
    case ne = 'ne';
    case no = 'no';
    case oc = 'oc';
    case fa = 'fa';
    case pl = 'pl';
    case pt = 'pt';
    case pt_BR = 'pt-BR';
    case pt_PT = 'pt-PT';
    case pa = 'pa';
    case ro = 'ro';
    case ru = 'ru';
    case gd = 'gd';
    case sr = 'sr';
    case si = 'si';
    case sk = 'sk';
    case sl = 'sl';
    case es = 'es';
    case es_419 = 'es-419';
    case su = 'su';
    case sw = 'sw';
    case sv = 'sv';
    case ta = 'ta';
    case te = 'te';
    case th = 'th';
    case ti = 'ti';
    case tr = 'tr';
    case uk = 'uk';
    case ur = 'ur';
    case uz = 'uz';
    case vi = 'vi';
    case cy = 'cy';
    case xh = 'xh';
    case zu = 'zu';
    case kk = 'kk';
    case zh_HK = 'zh-HK';
    case zh_CN = 'zh-CN';
    case zh_TW = 'zh-TW';

    public function label(): string
    {
        return match($this) {
            self::af => 'Afrikaans',
            self::sq => 'Albanian',
            self::sm => 'Amharic',
            self::ar => 'Arabic',
            self::hy => 'Armenian',
            self::az => 'Azerbaijani',
            self::eu => 'Basque',
            self::be => 'Belarusian',
            self::bn => 'Bengali',
            self::bh => 'Bihari',
            self::bs => 'Bosnian',
            self::bg => 'Bulgarian',
            self::ca => 'Catalan',
            self::hr => 'Croatian',
            self::cs => 'Czech',
            self::da => 'Danish',
            self::nl => 'Dutch',
            self::en => 'English',
            self::eo => 'Esperanto',
            self::et => 'Estonian',
            self::fo => 'Faroese',
            self::tl => 'Filipino',
            self::fi => 'Finnish',
            self::fr => 'French',
            self::fy => 'Frisian',
            self::gl => 'Galician',
            self::ka => 'Georgian',
            self::de => 'German',
            self::el => 'Greek',
            self::gu => 'Gujarati',
            self::iw => 'Hebrew',
            self::hi => 'Hindi',
            self::hu => 'Hungarian',
            self::is => 'Icelandic',
            self::id => 'Indonesian',
            self::ia => 'Interlingua',
            self::ga => 'Irish',
            self::it => 'Italian',
            self::ja => 'Japanese',
            self::jw => 'Javanese',
            self::kn => 'Kannada',
            self::ko => 'Korean',
            self::la => 'Latin',
            self::lv => 'Latvian',
            self::lt => 'Lithuanian',
            self::mk => 'Macedonian',
            self::ms => 'Malay',
            self::ml => 'Malayam',
            self::mt => 'Maltese',
            self::mr => 'Marathi',
            self::ne => 'Nepali',
            self::no => 'Norwegian',
            self::oc => 'Occitan',
            self::fa => 'Persian',
            self::pl => 'Polish',
            self::pt => 'Portuguese',
            self::pt_BR => 'Portuguese (Brazil)',
            self::pt_PT => 'Portuguese (Portugal)',
            self::pa => 'Punjabi',
            self::ro => 'Romanian',
            self::ru => 'Russian',
            self::gd => 'Scots Gaelic',
            self::sr => 'Serbian',
            self::si => 'Sinhalese',
            self::sk => 'Slovak',
            self::sl => 'Slovenian',
            self::es => 'Spanish',
            self::es_419 => 'Spanish (Latin America)',
            self::su => 'Sudanese',
            self::sw => 'Swahili',
            self::sv => 'Swedish',
            self::ta => 'Tamil',
            self::te => 'Telugu',
            self::th => 'Thai',
            self::ti => 'Tigrinya',
            self::tr => 'Turkish',
            self::uk => 'Ukrainian',
            self::ur => 'Urdu',
            self::uz => 'Uzbek',
            self::vi => 'Vietnamese',
            self::cy => 'Welsh',
            self::xh => 'Xhosa',
            self::zu => 'Zulu',
            self::kk => 'Казахский',
            self::zh_HK => 'Китайский (Гонконг)',
            self::zh_CN => 'Китайский (КНР)',
            self::zh_TW => 'Китайский (Тайвань)',
        };
    }

    public static function list(): array
    {
        $result = [];
        foreach (self::cases() as $case) {
            $result[$case->value] = $case->label();
        }
        return $result;
    }

    public function getId(): ?int
    {
        static $langIds = null;
        
        if ($langIds === null) {
            $langIds = [];
            $csvPath = base_path('langs.csv');
            if (file_exists($csvPath)) {
                $handle = fopen($csvPath, 'r');
                if ($handle) {
                    $header = fgetcsv($handle);
                    $idIndex = array_search('id', $header);
                    $langIndex = array_search('lang', $header);
                    
                    if ($idIndex !== false && $langIndex !== false) {
                        while (($row = fgetcsv($handle)) !== false) {
                            if (count($row) > max($idIndex, $langIndex)) {
                                $langIds[$row[$langIndex]] = (int)$row[$idIndex];
                            }
                        }
                    } else {
                        $line = 2;
                        while (($row = fgetcsv($handle)) !== false) {
                            if (count($row) >= 1) {
                                $langIds[$row[0]] = $line - 1;
                            }
                            $line++;
                        }
                    }
                    fclose($handle);
                }
            }
        }
        
        return $langIds[$this->value] ?? null;
    }
}
