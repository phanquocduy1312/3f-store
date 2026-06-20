<?php
/**
 * News Crawler Script - Scraping from 3fstore.vn/tin-tuc
 */

// Disable warning/errors leakage
ini_set('display_errors', '1');
error_reporting(E_ALL);

// Increase time limit for scraping
set_time_limit(300);

require_once dirname(__DIR__) . '/public/index.php';

use App\Models\BlogPost;

header('Content-Type: text/plain; charset=utf-8');

echo "=============================================\n";
echo "Starting 3F Store News Crawler...\n";
echo "=============================================\n\n";

$baseUrl = "https://3fstore.vn";
$listUrlBase = $baseUrl . "/tin-tuc?page=";
$page = 1;
$scrapedCount = 0;
$blogPostModel = new BlogPost();

// Helper function to extract inner HTML of a DOMNode
function getInnerHTML($node) {
    $innerHTML = "";
    $children = $node->childNodes;
    foreach ($children as $child) {
        $innerHTML .= $node->ownerDocument->saveHTML($child);
    }
    return $innerHTML;
}

// Fetch helper using cURL
function fetchUrl($url) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    $html = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode !== 200) {
        return null;
    }
    return $html;
}

while (true) {
    $listUrl = $listUrlBase . $page;
    echo "Fetching page {$page}: {$listUrl}...\n";
    
    $html = fetchUrl($listUrl);
    if (!$html) {
        echo "[ERROR] Failed to fetch page {$page} or reached end.\n";
        break;
    }
    
    // Suppress libxml warnings
    libxml_use_internal_errors(true);
    $doc = new DOMDocument();
    $doc->loadHTML('<?xml encoding="utf-8" ?>' . $html);
    libxml_clear_errors();
    
    $xpath = new DOMXPath($doc);
    
    // Find all news-item elements
    // Sapo news list page: <div class="col-lg-3 col-md-4 col-sm-6 col-12 news-item">
    $items = $xpath->query("//div[contains(@class, 'news-item')]");
    
    if ($items->length === 0) {
        echo "[INFO] No more news items found on page {$page}. Crawling complete.\n";
        break;
    }
    
    echo "[INFO] Found {$items->length} articles on page {$page}.\n";
    
    foreach ($items as $item) {
        // Parse Title, Link, Date, Summary
        $title = "";
        $link = "";
        $thumbnailUrl = "";
        $summary = "";
        $dateStr = "";
        
        // 1. Link & Title from H3 a or news-item-img a
        $h3Links = $xpath->query(".//h3/a", $item);
        if ($h3Links->length > 0) {
            $linkNode = $h3Links->item(0);
            $link = $linkNode->getAttribute('href');
            $title = trim($linkNode->nodeValue);
        } else {
            $imgLinks = $xpath->query(".//a[contains(@class, 'news-item-img')]", $item);
            if ($imgLinks->length > 0) {
                $linkNode = $imgLinks->item(0);
                $link = $linkNode->getAttribute('href');
                $title = $linkNode->getAttribute('title');
            }
        }
        
        if (empty($link)) {
            continue;
        }
        
        // 2. Thumbnail
        $imgs = $xpath->query(".//img", $item);
        if ($imgs->length > 0) {
            $img = $imgs->item(0);
            $thumbnailUrl = $img->getAttribute('data-src') ?: $img->getAttribute('src');
            if (strpos($thumbnailUrl, 'data:image') === 0 && $img->getAttribute('data-src')) {
                $thumbnailUrl = $img->getAttribute('data-src');
            }
            
            // Normalize thumbnail URL
            if (!empty($thumbnailUrl)) {
                if (strpos($thumbnailUrl, '//') === 0) {
                    $thumbnailUrl = 'https:' . $thumbnailUrl;
                } elseif (strpos($thumbnailUrl, '/') === 0) {
                    $thumbnailUrl = $baseUrl . $thumbnailUrl;
                }
            }
        }
        
        // 3. Date
        $dates = $xpath->query(".//p[contains(@class, 'news-item-date')]", $item);
        if ($dates->length > 0) {
            $dateStr = trim($dates->item(0)->nodeValue);
        }
        
        // 4. Summary
        $sums = $xpath->query(".//div[contains(@class, 'article-sum')]", $item);
        if ($sums->length > 0) {
            $summary = trim($sums->item(0)->nodeValue);
        }
        
        // 5. Extract slug from link
        $slug = basename($link);
        if (strpos($slug, '?') !== false) {
            $slug = explode('?', $slug)[0];
        }
        
        echo " -> Scraping detail: [{$title}] (Slug: {$slug})\n";
        
        // Request Detail page for full content
        $detailUrl = $baseUrl . $link;
        $detailHtml = fetchUrl($detailUrl);
        
        $contentHtml = "";
        $author = "Admin";
        $publishedAt = null;
        
        // Parse published date
        if (!empty($dateStr)) {
            $timestamp = strtotime($dateStr);
            if ($timestamp) {
                $publishedAt = date('Y-m-d H:i:s', $timestamp);
            }
        }
        if (!$publishedAt) {
            $publishedAt = date('Y-m-d H:i:s');
        }
        
        if ($detailHtml) {
            $detailDoc = new DOMDocument();
            @$detailDoc->loadHTML('<?xml encoding="utf-8" ?>' . $detailHtml);
            $detailXpath = new DOMXPath($detailDoc);
            
            // Look for <div class="article-details nd-toc-content">
            $detailsNode = $detailXpath->query("//div[contains(@class, 'article-details')]");
            if ($detailsNode->length > 0) {
                $contentHtml = getInnerHTML($detailsNode->item(0));
            } else {
                // Fallback to article-main
                $mainNode = $detailXpath->query("//article[contains(@class, 'article-main')]");
                if ($mainNode->length > 0) {
                    $contentHtml = getInnerHTML($mainNode->item(0));
                }
            }
            
            // Extract author if available
            $authorNodes = $detailXpath->query("//*[contains(@class, 'author') or contains(@class, 'user')]");
            if ($authorNodes->length > 0) {
                $authorText = trim($authorNodes->item(0)->nodeValue);
                if (!empty($authorText) && strlen($authorText) < 50) {
                    $author = $authorText;
                }
            }
        }
        
        if (empty($contentHtml)) {
            $contentHtml = "<p>" . htmlspecialchars($summary) . "</p>";
        }
        
        // Clean and absolute-ize URLs inside rich text content
        // 1. //img.cdn.com -> https://img.cdn.com
        $contentHtml = preg_replace('/src="\/\/([^"]+)"/', 'src="https://\\1"', $contentHtml);
        // 2. /uploads/image.jpg -> https://3fstore.vn/uploads/image.jpg
        $contentHtml = preg_replace('/src="\/([^\/][^"]*)"/', 'src="https://3fstore.vn/\\1"', $contentHtml);
        
        // Save to Database
        $blogData = [
            'title' => $title,
            'slug' => $slug,
            'summary' => $summary,
            'content' => $contentHtml,
            'thumbnail_url' => $thumbnailUrl,
            'author' => $author,
            'published_at' => $publishedAt
        ];
        
        $success = $blogPostModel->upsert($blogData);
        if ($success) {
            echo "    [SUCCESS] Saved to database.\n";
            $scrapedCount++;
        } else {
            echo "    [ERROR] Failed to save to database.\n";
        }
        
        // Wait brief moment to be polite
        usleep(300000);
    }
    
    $page++;
    // Let's safe-guard page limit
    if ($page > 10) {
        break;
    }
}

echo "\n=============================================\n";
echo "Crawling finished! Total articles imported: {$scrapedCount}\n";
echo "=============================================\n";
