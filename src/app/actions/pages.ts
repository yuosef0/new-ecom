"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// --- Pages Actions ---

export async function updatePage(slug: string, data: { title: string; content: string }) {
    const supabase = await createClient();

    console.log(`Updating page: ${slug}`, data);
    const { error } = await supabase
        .from("pages")
        .update(data)
        .eq("slug", slug);

    if (error) {
        console.error(`Error updating page ${slug}:`, error);
    } else {
        console.log(`Successfully updated page ${slug}`);
    }

    if (error) {
        throw new Error(error.message);
    }

    revalidatePath(`/admin/${slug}`);
    revalidatePath(`/${slug}`, 'page');
    // Also revalidate the path with layout to be safe
    revalidatePath(`/${slug}`, 'layout');

    if (slug === 'faqs') {
        revalidatePath('/faqs');
        revalidatePath('/faqs', 'page');
    }
}

export async function getPage(slug: string) {
    const supabase = await createClient();
    console.log(`Getting page: ${slug}`);

    const { data, error } = await supabase
        .from("pages")
        .select("*")
        .eq("slug", slug)
        .single();

    if (error) {
        console.error(`Error getting page ${slug}:`, error);
        return null;
    }
    console.log(`Got page ${slug}:`, data ? "Found" : "Not Found");

    if (error) {
        return null;
    }

    return data;
}

export async function getPages() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("pages")
        .select("*")
        .order("slug");

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

// --- FAQs Actions ---

export async function getFaqItems() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("faq_items")
        .select("*")
        .order("category")
        .order("sort_order");

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

export async function createFaqItem(data: { question: string; answer: string; category: string; sort_order: number }) {
    const supabase = await createClient();
    const { error } = await supabase.from("faq_items").insert(data);
    if (error) throw new Error(error.message);
    revalidatePath("/admin/faqs");
    revalidatePath("/faqs");
}

export async function updateFaqItem(id: string, data: { question: string; answer: string; category: string; sort_order: number }) {
    const supabase = await createClient();
    const { error } = await supabase.from("faq_items").update(data).eq("id", id);
    if (error) throw new Error(error.message);
    revalidatePath("/admin/faqs");
    revalidatePath("/faqs");
}

export async function deleteFaqItem(id: string) {
    const supabase = await createClient();
    const { error } = await supabase.from("faq_items").delete().eq("id", id);
    if (error) throw new Error(error.message);
    revalidatePath("/admin/faqs");
    revalidatePath("/faqs");
}
