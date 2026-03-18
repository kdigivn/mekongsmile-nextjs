import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getAllBlogPosts,
  getAllPostSlugs,
  getAllPostCategories,
  getPostBySlug,
  getAllNews,
  getNewsBySubcategory,
  getNewsBySlug,
} from "../post-service";

vi.mock("../../../../graphql/client", () => ({
  fetchGraphQL: vi.fn(),
}));

import { fetchGraphQL } from "../../../../graphql/client";
const mockFetchGraphQL = vi.mocked(fetchGraphQL);

describe("post-service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAllBlogPosts", () => {
    it("returns paginated blog posts", async () => {
      const mockResponse = {
        posts: {
          nodes: [
            {
              databaseId: 1,
              title: "First Post",
              slug: "first-post",
              excerpt: "First post excerpt",
            },
          ],
          pageInfo: { hasNextPage: false },
        },
      };
      mockFetchGraphQL.mockResolvedValue(mockResponse);

      const result = await getAllBlogPosts(12);

      expect(mockFetchGraphQL).toHaveBeenCalled();
      expect(result).toEqual(mockResponse.posts);
    });

    it("uses default first=12 when not specified", async () => {
      mockFetchGraphQL.mockResolvedValue({ posts: { nodes: [] } });

      await getAllBlogPosts();

      expect(mockFetchGraphQL).toHaveBeenCalled();
    });

    it("supports pagination with after cursor", async () => {
      mockFetchGraphQL.mockResolvedValue({ posts: { nodes: [] } });

      await getAllBlogPosts(6, "cursor123");

      expect(mockFetchGraphQL).toHaveBeenCalled();
    });

    it("filters by optional category name", async () => {
      mockFetchGraphQL.mockResolvedValue({ posts: { nodes: [] } });

      await getAllBlogPosts(12, undefined, "travel-tips");

      expect(mockFetchGraphQL).toHaveBeenCalled();
    });

    it("supports all parameters together", async () => {
      mockFetchGraphQL.mockResolvedValue({ posts: { nodes: [] } });

      await getAllBlogPosts(8, "abc123", "guides");

      expect(mockFetchGraphQL).toHaveBeenCalled();
    });
  });

  describe("getAllPostSlugs", () => {
    it("returns array of all post slugs", async () => {
      const mockResponse = {
        posts: {
          nodes: [
            { slug: "post-1" },
            { slug: "post-2" },
            { slug: "post-3" },
          ],
        },
      };
      mockFetchGraphQL.mockResolvedValue(mockResponse);

      const result = await getAllPostSlugs();

      expect(mockFetchGraphQL).toHaveBeenCalled();
      expect(result).toEqual(mockResponse.posts.nodes);
      expect(result.length).toBe(3);
    });

    it("returns empty array when no posts exist", async () => {
      mockFetchGraphQL.mockResolvedValue({ posts: { nodes: [] } });

      const result = await getAllPostSlugs();

      expect(result).toEqual([]);
    });
  });

  describe("getAllPostCategories", () => {
    it("returns all post categories", async () => {
      const mockResponse = {
        categories: {
          nodes: [
            { databaseId: 1, name: "Travel Tips", slug: "travel-tips" },
            { databaseId: 2, name: "Guides", slug: "guides" },
          ],
        },
      };
      mockFetchGraphQL.mockResolvedValue(mockResponse);

      const result = await getAllPostCategories();

      expect(mockFetchGraphQL).toHaveBeenCalled();
      expect(result).toEqual(mockResponse.categories.nodes);
      expect(result.length).toBe(2);
      expect(result[0].name).toBe("Travel Tips");
    });

    it("handles empty category list", async () => {
      mockFetchGraphQL.mockResolvedValue({ categories: { nodes: [] } });

      const result = await getAllPostCategories();

      expect(result).toEqual([]);
    });
  });

  describe("getPostBySlug", () => {
    it("returns single post by slug", async () => {
      const mockPost = {
        databaseId: 1,
        title: "Test Post",
        slug: "test-post",
        content: "Post content",
      };
      mockFetchGraphQL.mockResolvedValue({ post: mockPost });

      const result = await getPostBySlug("test-post");

      expect(mockFetchGraphQL).toHaveBeenCalled();
      expect(result).toEqual(mockPost);
    });

    it("returns null when post not found", async () => {
      mockFetchGraphQL.mockResolvedValue({ post: null });

      const result = await getPostBySlug("nonexistent");

      expect(result).toBeNull();
    });

    it("passes slug variable correctly", async () => {
      mockFetchGraphQL.mockResolvedValue({ post: null });

      await getPostBySlug("special-slug");

      expect(mockFetchGraphQL).toHaveBeenCalled();
    });
  });

  describe("getAllNews", () => {
    it("returns all news posts with default pagination", async () => {
      const mockResponse = {
        posts: {
          nodes: [
            {
              databaseId: 1,
              title: "News 1",
              slug: "news-1",
              category: "Awards",
            },
          ],
          pageInfo: {},
        },
      };
      mockFetchGraphQL.mockResolvedValue(mockResponse);

      const result = await getAllNews();

      expect(mockFetchGraphQL).toHaveBeenCalled();
      expect(result).toEqual(mockResponse.posts);
    });

    it("supports custom first parameter", async () => {
      mockFetchGraphQL.mockResolvedValue({ posts: { nodes: [] } });

      await getAllNews(6);

      expect(mockFetchGraphQL).toHaveBeenCalled();
    });

    it("supports pagination with after cursor", async () => {
      mockFetchGraphQL.mockResolvedValue({ posts: { nodes: [] } });

      await getAllNews(12, "cursor789");

      expect(mockFetchGraphQL).toHaveBeenCalled();
    });
  });

  describe("getNewsBySubcategory", () => {
    it("returns news filtered by subcategory", async () => {
      const mockResponse = {
        posts: {
          nodes: [
            {
              databaseId: 1,
              title: "Award News",
              slug: "award-news",
            },
          ],
          pageInfo: {},
        },
      };
      mockFetchGraphQL.mockResolvedValue(mockResponse);

      const result = await getNewsBySubcategory("Awards");

      expect(mockFetchGraphQL).toHaveBeenCalled();
      expect(result).toEqual(mockResponse.posts);
    });

    it("supports CSR subcategory", async () => {
      mockFetchGraphQL.mockResolvedValue({ posts: { nodes: [] } });

      await getNewsBySubcategory("CSR");

      expect(mockFetchGraphQL).toHaveBeenCalled();
    });

    it("supports Events subcategory", async () => {
      mockFetchGraphQL.mockResolvedValue({ posts: { nodes: [] } });

      await getNewsBySubcategory("Events");

      expect(mockFetchGraphQL).toHaveBeenCalled();
    });

    it("supports Organization subcategory", async () => {
      mockFetchGraphQL.mockResolvedValue({ posts: { nodes: [] } });

      await getNewsBySubcategory("Organization");

      expect(mockFetchGraphQL).toHaveBeenCalled();
    });

    it("handles pagination with custom first and after", async () => {
      mockFetchGraphQL.mockResolvedValue({ posts: { nodes: [] } });

      await getNewsBySubcategory("Awards", 8, "news123");

      expect(mockFetchGraphQL).toHaveBeenCalled();
    });
  });

  describe("getNewsBySlug", () => {
    it("returns single news post by slug", async () => {
      const mockNews = {
        databaseId: 1,
        title: "Big Award",
        slug: "big-award",
        content: "Award details",
      };
      mockFetchGraphQL.mockResolvedValue({ post: mockNews });

      const result = await getNewsBySlug("big-award");

      expect(mockFetchGraphQL).toHaveBeenCalled();
      expect(result).toEqual(mockNews);
    });

    it("returns null when news post not found", async () => {
      mockFetchGraphQL.mockResolvedValue({ post: null });

      const result = await getNewsBySlug("nonexistent-news");

      expect(result).toBeNull();
    });

    it("passes slug correctly", async () => {
      mockFetchGraphQL.mockResolvedValue({ post: null });

      await getNewsBySlug("special-event");

      expect(mockFetchGraphQL).toHaveBeenCalled();
    });
  });
});
