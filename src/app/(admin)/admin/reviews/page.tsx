"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface Review {
  id: string;
  product_id: string;
  customer_name: string;
  customer_email: string;
  rating: number;
  title: string | null;
  comment: string | null;
  is_verified_purchase: boolean;
  is_approved: boolean;
  helpful_count: number;
  created_at: string;
  products?: {
    name: string;
    slug: string;
  };
}

type FilterType = "all" | "approved" | "pending";

export default function ReviewsManagementPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  useEffect(() => {
    loadReviews();
  }, []);

  useEffect(() => {
    filterReviews();
  }, [reviews, activeFilter]);

  const loadReviews = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("reviews")
        .select(`
          *,
          products (
            name,
            slug
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterReviews = () => {
    switch (activeFilter) {
      case "approved":
        setFilteredReviews(reviews.filter((r) => r.is_approved));
        break;
      case "pending":
        setFilteredReviews(reviews.filter((r) => !r.is_approved));
        break;
      default:
        setFilteredReviews(reviews);
    }
  };

  const approveReview = async (id: string) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("reviews")
        .update({ is_approved: true })
        .eq("id", id);

      if (error) throw error;
      setSuccess("✅ تم قبول التقييم بنجاح");
      loadReviews();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const rejectReview = async (id: string) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("reviews")
        .update({ is_approved: false })
        .eq("id", id);

      if (error) throw error;
      setSuccess("✅ تم رفض التقييم");
      loadReviews();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const deleteReview = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا التقييم؟")) return;

    try {
      const supabase = createClient();
      const { error } = await supabase.from("reviews").delete().eq("id", id);

      if (error) throw error;
      setSuccess("✅ تم حذف التقييم بنجاح");
      loadReviews();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`material-icons text-lg ${
              star <= rating ? "text-yellow-500" : "text-gray-300"
            }`}
          >
            star
          </span>
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-2 text-gray-500 text-sm">جارٍ التحميل...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">إدارة التقييمات</h1>
        <p className="mt-2 text-gray-600">مراجعة وإدارة تقييمات العملاء</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-4">
          {success}
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">إجمالي التقييمات</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{reviews.length}</p>
            </div>
            <span className="material-icons-outlined text-3xl text-gray-400">rate_review</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">التقييمات المعتمدة</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {reviews.filter((r) => r.is_approved).length}
              </p>
            </div>
            <span className="material-icons-outlined text-3xl text-green-400">check_circle</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">بانتظار المراجعة</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">
                {reviews.filter((r) => !r.is_approved).length}
              </p>
            </div>
            <span className="material-icons-outlined text-3xl text-orange-400">pending</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex gap-4 px-6">
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                activeFilter === "all"
                  ? "border-brand-primary text-brand-primary"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              الكل ({reviews.length})
            </button>
            <button
              onClick={() => setActiveFilter("approved")}
              className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                activeFilter === "approved"
                  ? "border-brand-primary text-brand-primary"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              المعتمدة ({reviews.filter((r) => r.is_approved).length})
            </button>
            <button
              onClick={() => setActiveFilter("pending")}
              className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                activeFilter === "pending"
                  ? "border-brand-primary text-brand-primary"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              قيد الانتظار ({reviews.filter((r) => !r.is_approved).length})
            </button>
          </div>
        </div>

        {/* Reviews List */}
        {filteredReviews.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <span className="material-icons-outlined text-5xl text-gray-300 mb-4">
              rate_review
            </span>
            <p>لا توجد تقييمات</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredReviews.map((review) => (
              <div key={review.id} className="p-6 hover:bg-gray-50">
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Review Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {renderStars(review.rating)}
                          {review.is_verified_purchase && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              ✓ عملية شراء موثقة
                            </span>
                          )}
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              review.is_approved
                                ? "bg-green-100 text-green-800"
                                : "bg-orange-100 text-orange-800"
                            }`}
                          >
                            {review.is_approved ? "معتمد" : "بانتظار المراجعة"}
                          </span>
                        </div>

                        {review.title && (
                          <h3 className="font-semibold text-gray-900 mb-1">{review.title}</h3>
                        )}

                        {review.comment && (
                          <p className="text-gray-700 text-sm mb-3">
                            {review.comment.length > 200
                              ? `${review.comment.substring(0, 200)}...`
                              : review.comment}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <span className="material-icons-outlined text-sm">person</span>
                            {review.customer_name}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="material-icons-outlined text-sm">email</span>
                            {review.customer_email}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="material-icons-outlined text-sm">schedule</span>
                            {formatDate(review.created_at)}
                          </span>
                          {review.helpful_count > 0 && (
                            <span className="flex items-center gap-1">
                              <span className="material-icons-outlined text-sm">thumb_up</span>
                              {review.helpful_count} مفيد
                            </span>
                          )}
                        </div>

                        {review.products && (
                          <div className="mt-2 flex items-center gap-1 text-sm text-brand-primary">
                            <span className="material-icons-outlined text-sm">shopping_bag</span>
                            <span>{review.products.name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex md:flex-col gap-2">
                    {!review.is_approved && (
                      <button
                        onClick={() => approveReview(review.id)}
                        className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <span className="material-icons-outlined text-sm">check</span>
                        قبول
                      </button>
                    )}

                    {review.is_approved && (
                      <button
                        onClick={() => rejectReview(review.id)}
                        className="flex items-center gap-1 px-3 py-2 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 transition-colors"
                      >
                        <span className="material-icons-outlined text-sm">close</span>
                        رفض
                      </button>
                    )}

                    <button
                      onClick={() => setSelectedReview(review)}
                      className="flex items-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <span className="material-icons-outlined text-sm">visibility</span>
                      عرض
                    </button>

                    <button
                      onClick={() => deleteReview(review.id)}
                      className="flex items-center gap-1 px-3 py-2 bg-red-100 text-red-700 text-sm rounded-lg hover:bg-red-200 transition-colors"
                    >
                      <span className="material-icons-outlined text-sm">delete</span>
                      حذف
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Details Modal */}
      {selectedReview && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedReview(null)}
        >
          <div
            className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <h2 className="text-xl font-bold text-gray-900">تفاصيل التقييم</h2>
                <button
                  onClick={() => setSelectedReview(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="material-icons-outlined">close</span>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                {renderStars(selectedReview.rating)}
                <span className="text-lg font-semibold text-gray-900">
                  {selectedReview.rating} من 5
                </span>
              </div>

              {selectedReview.title && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">العنوان</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedReview.title}</p>
                </div>
              )}

              {selectedReview.comment && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">التعليق</p>
                  <p className="text-gray-700">{selectedReview.comment}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">اسم العميل</p>
                  <p className="text-gray-900">{selectedReview.customer_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">البريد الإلكتروني</p>
                  <p className="text-gray-900 text-sm">{selectedReview.customer_email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">تاريخ التقييم</p>
                  <p className="text-gray-900 text-sm">{formatDate(selectedReview.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">الحالة</p>
                  <p className={selectedReview.is_approved ? "text-green-600" : "text-orange-600"}>
                    {selectedReview.is_approved ? "معتمد" : "بانتظار المراجعة"}
                  </p>
                </div>
              </div>

              {selectedReview.products && (
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-500 mb-1">المنتج</p>
                  <p className="text-brand-primary">{selectedReview.products.name}</p>
                </div>
              )}

              <div className="flex items-center gap-2 pt-4">
                {selectedReview.is_verified_purchase && (
                  <span className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded">
                    ✓ عملية شراء موثقة
                  </span>
                )}
                {selectedReview.helpful_count > 0 && (
                  <span className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded">
                    👍 {selectedReview.helpful_count} شخص وجد هذا مفيداً
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
