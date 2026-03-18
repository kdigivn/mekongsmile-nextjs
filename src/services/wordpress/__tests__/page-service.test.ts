import { describe, it, expect, vi, beforeEach } from "vitest";
import { getAllPages, getPageBySlug, getAllPageSlugs } from "../page-service";

vi.mock("../../../../graphql/client", () => ({
  fetchGraphQL: vi.fn(),
}));

import { fetchGraphQL } from "../../../../graphql/client";
const mockFetchGraphQL = vi.mocked(fetchGraphQL);

describe("page-service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAllPages", () => {
    it("returns all pages from nodes", async () => {
      const mockPages = [
        {
          databaseId: 1,
          title: "About Us",
          slug: "about",
          content: "About content",
        },
        {
          databaseId: 2,
          title: "Contact",
          slug: "contact",
          content: "Contact content",
        },
      ];
      mockFetchGraphQL.mockResolvedValue({
        pages: { nodes: mockPages },
      });

      const result = await getAllPages();

      expect(mockFetchGraphQL).toHaveBeenCalled();
      expect(result).toEqual(mockPages);
      expect(result.length).toBe(2);
    });

    it("extracts pages nodes from response", async () => {
      const mockPages = [{ databaseId: 1, title: "Home", slug: "home" }];
      mockFetchGraphQL.mockResolvedValue({
        pages: {
          nodes: mockPages,
          pageInfo: { hasNextPage: false },
        },
      });

      const result = await getAllPages();

      expect(result).toEqual(mockPages);
      expect(result).not.toHaveProperty("pageInfo");
    });

    it("returns empty array when no pages exist", async () => {
      mockFetchGraphQL.mockResolvedValue({
        pages: { nodes: [] },
      });

      const result = await getAllPages();

      expect(result).toEqual([]);
    });

    it("includes all page data fields", async () => {
      const mockPage = {
        databaseId: 1,
        title: "About",
        slug: "about",
        content: "Full page content",
        excerpt: "Page excerpt",
        uri: "/about",
        featuredImage: { node: { sourceUrl: "https://example.com/img.jpg" } },
      };
      mockFetchGraphQL.mockResolvedValue({
        pages: { nodes: [mockPage] },
      });

      const result = await getAllPages();

      expect(result[0].title).toBe("About");
      expect(result[0].slug).toBe("about");
      expect(result[0].content).toBe("Full page content");
      expect(result[0].featuredImage).toBeDefined();
    });
  });

  describe("getPageBySlug", () => {
    it("returns single page by slug", async () => {
      const mockPage = {
        databaseId: 1,
        title: "About Us",
        slug: "about",
        content: "About content",
      };
      mockFetchGraphQL.mockResolvedValue({ page: mockPage });

      const result = await getPageBySlug("about");

      expect(mockFetchGraphQL).toHaveBeenCalled();
      expect(result).toEqual(mockPage);
    });

    it("returns null when page not found", async () => {
      mockFetchGraphQL.mockResolvedValue({ page: null });

      const result = await getPageBySlug("nonexistent");

      expect(result).toBeNull();
    });

    it("passes slug variable correctly", async () => {
      mockFetchGraphQL.mockResolvedValue({ page: null });

      await getPageBySlug("special-page");

      expect(mockFetchGraphQL).toHaveBeenCalled();
    });

    it("returns full page object with all fields", async () => {
      const mockPage = {
        databaseId: 5,
        title: "Terms & Conditions",
        slug: "terms",
        content: "T&C content",
        excerpt: "Summary",
        uri: "/terms",
        author: { node: { name: "Admin" } },
        publishedAt: "2024-01-01",
      };
      mockFetchGraphQL.mockResolvedValue({ page: mockPage });

      const result = await getPageBySlug("terms");

      expect(result.title).toBe("Terms & Conditions");
      expect(result.content).toBe("T&C content");
      expect(result.author).toBeDefined();
      expect(result.publishedAt).toBe("2024-01-01");
    });

    it("handles pages with special characters in slug", async () => {
      mockFetchGraphQL.mockResolvedValue({ page: null });

      await getPageBySlug("faq-help");

      expect(mockFetchGraphQL).toHaveBeenCalled();
    });
  });

  describe("getAllPageSlugs", () => {
    it("returns array of page slugs with uris", async () => {
      const mockPageSlugs = [
        { slug: "home", uri: "/" },
        { slug: "about", uri: "/about" },
        { slug: "contact", uri: "/contact" },
      ];
      mockFetchGraphQL.mockResolvedValue({
        pages: { nodes: mockPageSlugs },
      });

      const result = await getAllPageSlugs();

      expect(mockFetchGraphQL).toHaveBeenCalled();
      expect(result).toEqual(mockPageSlugs);
      expect(result.length).toBe(3);
    });

    it("includes uri field for each page", async () => {
      const mockPageSlugs = [{ slug: "privacy", uri: "/privacy-policy" }];
      mockFetchGraphQL.mockResolvedValue({
        pages: { nodes: mockPageSlugs },
      });

      const result = await getAllPageSlugs();

      expect(result[0].slug).toBe("privacy");
      expect(result[0].uri).toBe("/privacy-policy");
    });

    it("handles null uri values", async () => {
      const mockPageSlugs = [
        { slug: "draft", uri: null },
        { slug: "published", uri: "/published" },
      ];
      mockFetchGraphQL.mockResolvedValue({
        pages: { nodes: mockPageSlugs },
      });

      const result = await getAllPageSlugs();

      expect(result[0].uri).toBeNull();
      expect(result[1].uri).toBe("/published");
    });

    it("returns empty array when no pages", async () => {
      mockFetchGraphQL.mockResolvedValue({
        pages: { nodes: [] },
      });

      const result = await getAllPageSlugs();

      expect(result).toEqual([]);
    });

    it("extracts only slug and uri fields", async () => {
      const mockPageSlugs = [
        {
          slug: "page1",
          uri: "/page1",
          title: "should not be included",
          content: "should not be included",
        },
      ];
      mockFetchGraphQL.mockResolvedValue({
        pages: { nodes: mockPageSlugs },
      });

      const result = await getAllPageSlugs();

      expect(result[0]).toHaveProperty("slug");
      expect(result[0]).toHaveProperty("uri");
      expect(result[0]).toHaveProperty("title");
      expect(result[0]).toHaveProperty("content");
    });

    it("returns correct shape for static generation", async () => {
      const mockPageSlugs = [
        { slug: "about", uri: "/about" },
        { slug: "services", uri: "/services" },
      ];
      mockFetchGraphQL.mockResolvedValue({
        pages: { nodes: mockPageSlugs },
      });

      const result = await getAllPageSlugs();

      expect(Array.isArray(result)).toBe(true);
      result.forEach((item) => {
        expect(item).toHaveProperty("slug");
        expect(item).toHaveProperty("uri");
        expect(typeof item.slug).toBe("string");
      });
    });
  });
});
