<?php
namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Models\BlogPost;
use App\Helpers\AuthMiddleware;
use App\Services\UploadService;
use Exception;

class BlogPostController {
    /**
     * GET /api/blog-posts
     */
    public function getList() {
        try {
            $page = (int)Request::query('page', 1);
            $limit = (int)Request::query('limit', 10);
            $q = trim((string)Request::query('q', ''));
            $category = trim((string)Request::query('category', ''));
            $sort = trim((string)Request::query('sort', ''));

            $isAdmin = false;
            try {
                $token = AuthMiddleware::extractBearerToken();
                if (!empty($token)) {
                    $sessionModel = new \App\Models\AdminSession();
                    if ($sessionModel->validateToken($token)) {
                        $isAdmin = true;
                    }
                }
            } catch (Exception $e) {
                // Ignore
            }

            $model = new BlogPost();
            $data = $model->getPaginated($page, $limit, $q, $isAdmin, $category, $sort);

            Response::json([
                "success" => true,
                "data" => $data
            ], 200);
        } catch (Exception $e) {
            Response::json([
                "success" => false,
                "message" => "Lỗi lấy danh sách bài viết: " . $e->getMessage()
            ], 500);
        }
    }

    /**
     * GET /api/blog-posts/:slug
     */
    public function getDetail() {
        try {
            $slug = Request::query('slug', '');
            if ($slug === '') {
                Response::json(['success' => false, 'message' => 'Slug không hợp lệ.'], 400);
                return;
            }

            $model = new BlogPost();
            $post = $model->getBySlug($slug);

            if (!$post) {
                Response::json(['success' => false, 'message' => 'Không tìm thấy bài viết.'], 404);
                return;
            }

            $isAdmin = false;
            try {
                $token = AuthMiddleware::extractBearerToken();
                if (!empty($token)) {
                    $sessionModel = new \App\Models\AdminSession();
                    if ($sessionModel->validateToken($token)) {
                        $isAdmin = true;
                    }
                }
            } catch (Exception $e) {
                // Ignore
            }

            if (!$isAdmin) {
                // Public check: status must be published, and published_at must be in the past or now
                if (($post['status'] ?? 'published') !== 'published' || (!empty($post['published_at']) && strtotime($post['published_at']) > time())) {
                    Response::json(['success' => false, 'message' => 'Không tìm thấy bài viết.'], 404);
                    return;
                }
            }

            // Increment view count dynamically
            $model->incrementViews($slug);
            $post['view_count']++; // Update view count locally for immediate frontend display

            Response::json([
                "success" => true,
                "data" => $post
            ], 200);
        } catch (Exception $e) {
            Response::json([
                "success" => false,
                "message" => "Lỗi lấy chi tiết bài viết: " . $e->getMessage()
            ], 500);
        }
    }

    /**
     * GET /api/admin/blog-posts/crawl
     */
    public function adminCrawl() {
        try {
            // Set execution limit
            set_time_limit(300);
            ini_set('memory_limit', '256M');

            $baseUrl = "https://3fstore.vn";
            $listUrlBase = $baseUrl . "/tin-tuc?page=";
            $page = 1;
            $scrapedCount = 0;
            $model = new BlogPost();
            $log = [];

            // Helper to fetch html
            $fetchUrl = function($url) {
                $ch = curl_init();
                curl_setopt($ch, CURLOPT_URL, $url);
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
                curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
                curl_setopt($ch, CURLOPT_TIMEOUT, 20);
                $html = curl_exec($ch);
                $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
                curl_close($ch);
                return ($httpCode === 200) ? $html : null;
            };

            // Helper to get inner html
            $getInnerHTML = function($node) {
                $innerHTML = "";
                $children = $node->childNodes;
                foreach ($children as $child) {
                    $innerHTML .= $node->ownerDocument->saveHTML($child);
                }
                return $innerHTML;
            };

            while (true) {
                $listUrl = $listUrlBase . $page;
                $html = $fetchUrl($listUrl);
                if (!$html) {
                    $log[] = "Failed to fetch list page {$page} or reached end.";
                    break;
                }

                libxml_use_internal_errors(true);
                $doc = new \DOMDocument();
                $doc->loadHTML('<?xml encoding="utf-8" ?>' . $html);
                libxml_clear_errors();

                $xpath = new \DOMXPath($doc);
                $items = $xpath->query("//div[contains(@class, 'news-item')]");

                if ($items->length === 0) {
                    $log[] = "No news items found on page {$page}.";
                    break;
                }

                $log[] = "Found {$items->length} articles on page {$page}.";

                foreach ($items as $item) {
                    $title = "";
                    $link = "";
                    $thumbnailUrl = "";
                    $summary = "";
                    $dateStr = "";

                    // Find H3 link
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

                    if (empty($link)) continue;

                    // Parse thumbnail image
                    $imgs = $xpath->query(".//img", $item);
                    if ($imgs->length > 0) {
                        $img = $imgs->item(0);
                        $thumbnailUrl = $img->getAttribute('data-src') ?: $img->getAttribute('src');
                        if (strpos($thumbnailUrl, 'data:image') === 0 && $img->getAttribute('data-src')) {
                            $thumbnailUrl = $img->getAttribute('data-src');
                        }
                        if (!empty($thumbnailUrl)) {
                            if (strpos($thumbnailUrl, '//') === 0) {
                                $thumbnailUrl = 'https:' . $thumbnailUrl;
                            } elseif (strpos($thumbnailUrl, '/') === 0) {
                                $thumbnailUrl = $baseUrl . $thumbnailUrl;
                            }
                        }
                    }

                    // Parse date
                    $dates = $xpath->query(".//p[contains(@class, 'news-item-date')]", $item);
                    if ($dates->length > 0) {
                        $dateStr = trim($dates->item(0)->nodeValue);
                    }

                    // Parse summary
                    $sums = $xpath->query(".//div[contains(@class, 'article-sum')]", $item);
                    if ($sums->length > 0) {
                        $summary = trim($sums->item(0)->nodeValue);
                    }

                    $slug = basename($link);
                    if (strpos($slug, '?') !== false) {
                        $slug = explode('?', $slug)[0];
                    }

                    // Fetch detail content
                    $detailUrl = $baseUrl . $link;
                    $detailHtml = $fetchUrl($detailUrl);
                    $contentHtml = "";
                    $author = "Admin";
                    $publishedAt = null;

                    if ($detailHtml) {
                        $detailDoc = new \DOMDocument();
                        @$detailDoc->loadHTML('<?xml encoding="utf-8" ?>' . $detailHtml);
                        $detailXpath = new \DOMXPath($detailDoc);

                        $detailsNode = $detailXpath->query("//div[contains(@class, 'article-details')]");
                        if ($detailsNode->length > 0) {
                            $contentHtml = $getInnerHTML($detailsNode->item(0));
                        } else {
                            $mainNode = $detailXpath->query("//article[contains(@class, 'article-main')]");
                            if ($mainNode->length > 0) {
                                $contentHtml = $getInnerHTML($mainNode->item(0));
                            }
                        }

                        // Parse author and date from class blog-item-author
                        $authorNode = $detailXpath->query("//*[contains(@class, 'blog-item-author')]");
                        if ($authorNode->length > 0) {
                            $authorText = trim($authorNode->item(0)->nodeValue);
                            $parts = array_map('trim', explode("\n", $authorText));
                            if (!empty($parts[0])) {
                                $author = $parts[0];
                            }
                            if (isset($parts[1]) && !empty($parts[1])) {
                                $timestamp = strtotime($parts[1]);
                                if ($timestamp) {
                                    $publishedAt = date('Y-m-d H:i:s', $timestamp);
                                }
                            }
                        }
                    }

                    if (!$publishedAt) {
                        if (!empty($dateStr)) {
                            $timestamp = strtotime($dateStr);
                            if ($timestamp) {
                                $publishedAt = date('Y-m-d H:i:s', $timestamp);
                            }
                        }
                    }
                    if (!$publishedAt) {
                        $publishedAt = date('Y-m-d H:i:s');
                    }

                    if (empty($contentHtml)) {
                        $contentHtml = "<p>" . htmlspecialchars($summary) . "</p>";
                    }

                    // Normalize links in content
                    $contentHtml = preg_replace('/src="\/\/([^"]+)"/', 'src="https://\\1"', $contentHtml);
                    $contentHtml = preg_replace('/src="\/([^\/][^"]*)"/', 'src="https://3fstore.vn/\\1"', $contentHtml);

                    $blogData = [
                        'title' => $title,
                        'slug' => $slug,
                        'summary' => $summary,
                        'content' => $contentHtml,
                        'thumbnail_url' => $thumbnailUrl,
                        'author' => $author,
                        'published_at' => $publishedAt,
                        'category' => 'Tin tức 3F Store',
                        'category_slug' => 'tin-tuc-3f-store'
                    ];

                    $success = $model->upsert($blogData);
                    if ($success) {
                        $scrapedCount++;
                    }
                    usleep(100000); // 100ms throttle
                }

                $page++;
                if ($page > 10) break;
            }

            Response::json([
                "success" => true,
                "message" => "Crawling finished successfully.",
                "scrapedCount" => $scrapedCount,
                "log" => $log
            ], 200);

        } catch (Exception $e) {
            Response::json([
                "success" => false,
                "message" => "Lỗi thực hiện cào tin tức: " . $e->getMessage()
            ], 500);
        }
    }

    /**
     * POST /api/admin/blog-posts
     */
    public function adminCreate() {
        try {
            AuthMiddleware::requireAdmin();
            $data = Request::json();

            if (empty($data['title']) || empty($data['slug']) || empty($data['content'])) {
                Response::json(['success' => false, 'message' => 'Vui lòng nhập đầy đủ Tiêu đề, Slug và Nội dung.'], 400);
                return;
            }

            if (empty($data['category'])) {
                Response::json(['success' => false, 'message' => 'Vui lòng chọn loại tin.'], 400);
                return;
            }
            $data['category_slug'] = $this->generateCategorySlug($data['category']);

            $model = new BlogPost();
            // Automatically generate unique slug if not standard, or check uniqueness
            $existing = $model->getBySlug($data['slug']);
            if ($existing) {
                Response::json(['success' => false, 'message' => 'Slug này đã tồn tại, vui lòng đổi slug khác.'], 400);
                return;
            }

            $id = $model->create($data);
            if ($id) {
                Response::json(['success' => true, 'message' => 'Đã tạo bài viết thành công.', 'id' => $id], 201);
            } else {
                Response::json(['success' => false, 'message' => 'Lỗi lưu trữ bài viết.'], 500);
            }
        } catch (Exception $e) {
            Response::json(['success' => false, 'message' => 'Lỗi: ' . $e->getMessage()], 500);
        }
    }

    /**
     * PUT /api/admin/blog-posts/:id
     */
    public function adminUpdate() {
        try {
            AuthMiddleware::requireAdmin();
            $id = (int)Request::query('id', 0);
            if ($id <= 0) {
                Response::json(['success' => false, 'message' => 'ID bài viết không hợp lệ.'], 400);
                return;
            }

            $data = Request::json();
            if (empty($data['title']) || empty($data['slug']) || empty($data['content'])) {
                Response::json(['success' => false, 'message' => 'Vui lòng nhập đầy đủ Tiêu đề, Slug và Nội dung.'], 400);
                return;
            }

            if (empty($data['category'])) {
                Response::json(['success' => false, 'message' => 'Vui lòng chọn loại tin.'], 400);
                return;
            }
            $data['category_slug'] = $this->generateCategorySlug($data['category']);

            $model = new BlogPost();
            $existing = $model->getBySlug($data['slug']);
            if ($existing && (int)$existing['id'] !== $id) {
                Response::json(['success' => false, 'message' => 'Slug này đã bị trùng với bài viết khác.'], 400);
                return;
            }

            $success = $model->update($id, $data);
            if ($success) {
                Response::json(['success' => true, 'message' => 'Cập nhật bài viết thành công.'], 200);
            } else {
                Response::json(['success' => false, 'message' => 'Không tìm thấy bài viết hoặc lỗi cập nhật.'], 404);
            }
        } catch (Exception $e) {
            Response::json(['success' => false, 'message' => 'Lỗi: ' . $e->getMessage()], 500);
        }
    }

    /**
     * DELETE /api/admin/blog-posts/:id
     */
    public function adminDelete() {
        try {
            AuthMiddleware::requireAdmin();
            $id = (int)Request::query('id', 0);
            if ($id <= 0) {
                Response::json(['success' => false, 'message' => 'ID bài viết không hợp lệ.'], 400);
                return;
            }

            $model = new BlogPost();
            $success = $model->delete($id);
            if ($success) {
                Response::json(['success' => true, 'message' => 'Xóa bài viết thành công.'], 200);
            } else {
                Response::json(['success' => false, 'message' => 'Lỗi xóa bài viết.'], 500);
            }
        } catch (Exception $e) {
            Response::json(['success' => false, 'message' => 'Lỗi: ' . $e->getMessage()], 500);
        }
    }

    /**
     * POST /api/admin/blog-posts/upload
     */
    public function adminUploadImage() {
        try {
            AuthMiddleware::requireAdmin();
            if (empty($_FILES['image'])) {
                Response::json(['success' => false, 'message' => 'Không tìm thấy file ảnh tải lên.'], 400);
                return;
            }

            $result = UploadService::uploadBlogImage($_FILES['image']);
            Response::json([
                'success' => true,
                'message' => 'Tải ảnh lên thành công.',
                'url' => $result['url'],
                'image_url' => $result['image_url']
            ], 200);
        } catch (Exception $e) {
            Response::json(['success' => false, 'message' => 'Lỗi tải ảnh: ' . $e->getMessage()], 500);
        }
    }

    private function generateCategorySlug($str) {
        $str = mb_strtolower($str, 'UTF-8');
        $str = preg_replace('/(à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ)/', 'a', $str);
        $str = preg_replace('/(è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ)/', 'e', $str);
        $str = preg_replace('/(ì|í|ị|ỉ|ĩ)/', 'i', $str);
        $str = preg_replace('/(ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ)/', 'o', $str);
        $str = preg_replace('/(ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ)/', 'u', $str);
        $str = preg_replace('/(ỳ|ý|ỵ|ỷ|ỹ)/', 'y', $str);
        $str = preg_replace('/(đ)/', 'd', $str);
        $str = preg_replace('/([^a-z0-9-\s])/', '', $str);
        $str = preg_replace('/([\s-]+)/', '-', $str);
        return trim($str, '-');
    }
}
