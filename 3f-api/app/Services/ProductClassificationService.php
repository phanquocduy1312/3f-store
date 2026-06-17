<?php
namespace App\Services;

class ProductClassificationService
{
    public static function normalize(string $text): string {
        $text = mb_strtolower($text, 'UTF-8');
        $utf8 = [
            'a' => 'á|à|ả|ã|ạ|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ|A|Á|À|Ả|Ã|Ạ|Ă|Ắ|Ằ|Ẳ|Ẵ|Ặ|Â|Ấ|Ầ|Ẩ|Ẫ|Ậ',
            'd' => 'đ|Đ',
            'e' => 'é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ|E|É|È|Ẻ|Ẽ|Ẹ|Ê|Ế|Ề|Ể|Ễ|Ệ',
            'i' => 'í|ì|ỉ|ĩ|ị|I|Í|Ì|Ib|Ĩ|Ị',
            'o' => 'ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ|O|Ó|Ò|Ỏ|Õ|Ọ|Ô|Ố|Ồ|Ổ|Ỗ|Ộ|Ơ|Ớ|Ờ|Ở|Ỡ|Ợ',
            'u' => 'ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự|U|Ú|Ù|Ủ|Ũ|Ụ|Ư|Ứ|Ừ|Ử|Ữ|Ự',
            'y' => 'ý|ỳ|ỷ|ỹ|ỵ|Y|Ý|Ỳ|Ỷ|Ỹ|Ỵ',
        ];
        foreach ($utf8 as $ascii => $uni) {
            $text = preg_replace("/($uni)/i", $ascii, $text);
        }
        return $text;
    }

    public static function classifyPetType(string $name, ?string $description = ''): string {
        $desc = $description ?? '';
        $raw = mb_strtolower($name . ' ' . $desc, 'UTF-8');
        $norm = self::normalize($raw);
        
        $hasCat = false;
        $catKeywords = ['mèo', 'meo', 'cat', 'kitten', 'kitty', 'feline'];
        foreach ($catKeywords as $kw) {
            if (strpos($raw, $kw) !== false || strpos($norm, $kw) !== false) {
                $hasCat = true;
                break;
            }
        }
        
        $hasDog = false;
        $dogKeywords = ['chó', 'cho', 'dog', 'puppy', 'cún', 'cun', 'canine'];
        foreach ($dogKeywords as $kw) {
            if (strpos($raw, $kw) !== false || strpos($norm, $kw) !== false) {
                if ($kw === 'cho') {
                    // Check if "cho" is just a preposition like "cho mèo", "cho thú cưng", "cho em", "cho boss"
                    if (preg_match('/\bcho\s+(mèo|meo|thú cưng|thu cung|pet|boss|mèo con|meo con)\b/u', $norm)) {
                        // Skip false positive
                    } else {
                        $hasDog = true;
                        break;
                    }
                } else {
                    $hasDog = true;
                    break;
                }
            }
        }
        
        if ($hasCat && $hasDog) {
            return 'both';
        }
        if ($hasCat) {
            return 'cat';
        }
        if ($hasDog) {
            return 'dog';
        }
        
        // Check general pet keywords
        $petKeywords = ['thú cưng', 'thu cung', 'pet', 'mọi thú cưng', 'all pet'];
        foreach ($petKeywords as $kw) {
            if (strpos($raw, $kw) !== false || strpos($norm, $kw) !== false) {
                return 'both';
            }
        }
        
        return 'other';
    }

    public static function classifyProductType(string $name, ?string $description = ''): string {
        $desc = $description ?? '';
        $raw = mb_strtolower($name . ' ' . $desc, 'UTF-8');
        $norm = self::normalize($raw);
        
        // 1. Dry food
        $dryKeywords = ['hạt', 'hat', 'dry food', 'kibble'];
        foreach ($dryKeywords as $kw) {
            if (strpos($raw, $kw) !== false || strpos($norm, $kw) !== false) {
                return 'dry_food';
            }
        }
        
        // 2. Wet food
        $wetKeywords = ['pate', 'paté', 'lon', 'súp', 'sup', 'soup', 'wet food'];
        foreach ($wetKeywords as $kw) {
            if (strpos($raw, $kw) !== false || strpos($norm, $kw) !== false) {
                return 'wet_food';
            }
        }
        
        // 3. Treat
        $treatKeywords = ['snack', 'treat', 'thưởng', 'thuong', 'bánh thưởng', 'que', 'gói'];
        foreach ($treatKeywords as $kw) {
            if (strpos($raw, $kw) !== false || strpos($norm, $kw) !== false) {
                return 'treat';
            }
        }
        
        // 4. Litter
        $litterKeywords = ['cát', 'cat ve sinh', 'cát vệ sinh', 'litter', 'tofu'];
        foreach ($litterKeywords as $kw) {
            if (strpos($raw, $kw) !== false || strpos($norm, $kw) !== false) {
                return 'litter';
            }
        }
        
        // 5. Supplement
        $supplementKeywords = ['sữa', 'sua', 'dinh dưỡng', 'dinh duong', 'vitamin', 'canxi', 'gel', 'men tiêu hóa', 'men tieu hoa'];
        foreach ($supplementKeywords as $kw) {
            if (strpos($raw, $kw) !== false || strpos($norm, $kw) !== false) {
                return 'supplement';
            }
        }
        
        // 6. Accessory
        $accessoryKeywords = ['vòng cổ', 'vong co', 'dây', 'day', 'khay', 'bát', 'bat', 'lược', 'luoc', 'đồ chơi', 'do choi', 'phụ kiện', 'phu kien'];
        foreach ($accessoryKeywords as $kw) {
            if (strpos($raw, $kw) !== false || strpos($norm, $kw) !== false) {
                return 'accessory';
            }
        }
        
        // 7. Hygiene
        $hygieneKeywords = ['khử mùi', 'khu mui', 'xịt', 'xit', 'tắm', 'tam', 'gội', 'goi', 'vệ sinh tai', 've sinh tai', 'vệ sinh mắt', 've sinh mat', 'sữa tắm', 'sua tam'];
        foreach ($hygieneKeywords as $kw) {
            if (strpos($raw, $kw) !== false || strpos($norm, $kw) !== false) {
                return 'hygiene';
            }
        }
        
        // Check standalone "vệ sinh" for litter
        if (strpos($raw, 'vệ sinh') !== false || strpos($norm, 've sinh') !== false) {
            return 'litter';
        }
        
        return 'other';
    }

    public static function resolveCategorySlug(string $petType, string $productType, string $name, ?string $description = ''): string {
        $desc = $description ?? '';
        $raw = mb_strtolower($name . ' ' . $desc, 'UTF-8');
        $norm = self::normalize($raw);
        
        if ($productType === 'litter' || $productType === 'hygiene') {
            return 've-sinh-thu-cung';
        }
        if ($productType === 'supplement') {
            return 'sua-dinh-duong';
        }
        if ($productType === 'treat' || $productType === 'wet_food') {
            return 'pate-snack';
        }
        if (($petType === 'cat' || $petType === 'both') && $productType === 'dry_food') {
            return 'thuc-an-cho-meo';
        }
        if ($petType === 'dog' && $productType === 'dry_food') {
            return 'thuc-an-cho-cho';
        }
        
        $foodKeywords = ['thức ăn', 'thuc an', 'hạt', 'hat', 'pate', 'súp', 'sup', 'snack', 'thưởng', 'thuong'];
        $isFood = false;
        foreach ($foodKeywords as $kw) {
            if (strpos($raw, $kw) !== false || strpos($norm, $kw) !== false) {
                $isFood = true;
                break;
            }
        }
        
        if ($petType === 'cat' && $productType === 'other' && $isFood) {
            return 'thuc-an-cho-meo';
        }
        if ($petType === 'dog' && $productType === 'other' && $isFood) {
            return 'thuc-an-cho-cho';
        }
        if ($productType === 'accessory') {
            return 'phu-kien-do-choi';
        }
        
        return 'khac';
    }

    public static function detectBrand(string $name, ?string $description = ''): ?string {
        $text = mb_strtolower($name . ' ' . ($description ?? ''), 'UTF-8');
        $brands = [
            'Royal Canin' => ['royal canin', 'royalcanin'],
            'SmartHeart' => ['smartheart', 'smart heart'],
            'Nutrience' => ['nutrience'],
            'Ganador' => ['ganador'],
            'MaxWell' => ['maxwell'],
            'Minino' => ['minino'],
            'Whiskas' => ['whiskas'],
            'Pedigree' => ['pedigree'],
            'Me-O' => ['me-o', 'meo-o'],
            'PetChoice' => ['petchoice', 'pet choice'],
            'Refine' => ['refine'],
            'JerHigh' => ['jerhigh', 'jer high'],
            'PetQ' => ['petq'],
            'S2PET' => ['s2pet', 's2 pet'],
            'Faenbei' => ['faenbei'],
            'Lapaw' => ['lapaw'],
            'Wanpy' => ['wanpy'],
            'Ciao' => ['ciao']
        ];
        foreach ($brands as $brandName => $aliases) {
            foreach ($aliases as $alias) {
                if (strpos($text, $alias) !== false) {
                    return $brandName;
                }
            }
        }
        return null;
    }
}
