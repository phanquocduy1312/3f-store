<?php
namespace App\Services;

use App\Models\LoyaltyPointRuleModel;
use App\Models\LoyaltyProductionModel;

class LoyaltyPointService {
    /**
     * Calculates points from order amount using active rule configs.
     * Fallbacks to default rule (10k VND = 1 Point, floor) if no active rule exists.
     *
     * @param int $amount
     * @param string $source
     * @return int
     */
    public static function calculatePoints($amount, $source = "shopee") {
        $ruleModel = new LoyaltyPointRuleModel();
        $rule = $ruleModel->getActiveRule($source);

        if (!$rule) {
            $moneyPerPoint = 10000;
            $roundingMode = 'floor';
            $minOrderAmount = 0;
            $maxPoints = null;
            $multiplier = 1.0;
        } else {
            $moneyPerPoint = (int)$rule['money_per_point'];
            $roundingMode = $rule['rounding_mode'];
            $minOrderAmount = (int)$rule['min_order_amount'];
            $maxPoints = $rule['max_points_per_order'] !== null ? (int)$rule['max_points_per_order'] : null;
            $multiplier = (float)$rule['multiplier'];
        }

        if ($amount < $minOrderAmount) {
            return 0;
        }

        if ($moneyPerPoint <= 0) {
            return 0;
        }

        // Apply rules: (amount / moneyPerPoint) * multiplier
        $calculated = ($amount / $moneyPerPoint) * $multiplier;

        switch ($roundingMode) {
            case 'ceil':
                $points = (int)ceil($calculated);
                break;
            case 'round':
                $points = (int)round($calculated);
                break;
            case 'floor':
            default:
                $points = (int)floor($calculated);
                break;
        }

        if ($maxPoints !== null && $points > $maxPoints) {
            $points = $maxPoints;
        }

        return $points;
    }

    public static function previewPoints($amount, $customerId = null, $source = "shopee", $grantBirthday = false) {
        $basePoints = self::calculatePoints($amount, $source);
        $tierMultiplier = 1.0;
        $campaignMultiplier = 1.0;
        $birthdayMultiplier = 1.0;
        $tier = null;

        $production = new LoyaltyProductionModel();
        if (!empty($customerId)) {
            $tier = $production->ensureCustomerProfile($customerId);
            if ($tier && isset($tier['tier_multiplier'])) {
                $tierMultiplier = (float)$tier['tier_multiplier'];
            }
            $birthdayMultiplier = $production->getBirthdayMultiplier($customerId, $grantBirthday);
        }

        $campaignMultiplier = $production->getActiveCampaignMultiplier();
        $finalPoints = (int)floor($basePoints * $tierMultiplier * $campaignMultiplier * $birthdayMultiplier);

        return [
            "basePoints" => $basePoints,
            "tierMultiplier" => $tierMultiplier,
            "campaignMultiplier" => $campaignMultiplier,
            "birthdayMultiplier" => $birthdayMultiplier,
            "finalPoints" => $finalPoints,
            "tier" => $tier
        ];
    }
}
