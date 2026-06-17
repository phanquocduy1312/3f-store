<?php
namespace App\Services;

class PointService {
    /**
     * Calculates Shopee points based on the order amount.
     * Formula: 10,000 VND = 1 point.
     */
    public static function calculateShopeePoints($orderAmount) {
        return \App\Services\LoyaltyPointService::calculatePoints($orderAmount, "shopee");
    }

    /**
     * Computes the member tier based on approved points.
     */
    public static function calculateMemberTier($points) {
        $tier = (new \App\Models\LoyaltyProductionModel())->getTierForPoints((int)$points);
        return $tier ? $tier['name'] : "Silver";
    }
}
