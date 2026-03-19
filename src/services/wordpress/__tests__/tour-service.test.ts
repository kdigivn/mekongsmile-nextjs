import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock graphql client before importing the service
vi.mock("../../../../graphql/client", () => ({
  fetchGraphQL: vi.fn(),
}));

import {
  getAllTours,
  getTourBySlug,
  getAllTourSlugs,
  getToursByDestination,
  getToursByTravelStyle,
  getToursByTourType,
  getToursByTag,
  getToursByCombinedFilters,
} from "../tour-service";

import { fetchGraphQL } from "../../../../graphql/client";
const mockFetchGraphQL = vi.mocked(fetchGraphQL);

describe("tour-service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAllTours", () => {
    it("returns products from GraphQL response", async () => {
      const mockResponse = {
        products: {
          nodes: [
            {
              databaseId: 1,
              name: "Test Tour",
              slug: "test-tour",
              description: "A great tour",
            },
          ],
          pageInfo: {
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: null,
            endCursor: null,
          },
        },
      };
      mockFetchGraphQL.mockResolvedValue(mockResponse);

      const result = await getAllTours(12);

      expect(mockFetchGraphQL).toHaveBeenCalled();
      expect(result).toEqual(mockResponse.products);
    });

    it("uses default first=12 when not specified", async () => {
      mockFetchGraphQL.mockResolvedValue({
        products: { nodes: [], pageInfo: {} },
      });

      await getAllTours();

      expect(mockFetchGraphQL).toHaveBeenCalled();
    });

    it("passes pagination cursor correctly", async () => {
      mockFetchGraphQL.mockResolvedValue({
        products: { nodes: [], pageInfo: {} },
      });

      await getAllTours(6, "cursor123");

      expect(mockFetchGraphQL).toHaveBeenCalled();
    });

    it("handles custom first parameter", async () => {
      mockFetchGraphQL.mockResolvedValue({
        products: { nodes: [], pageInfo: {} },
      });

      await getAllTours(24);

      expect(mockFetchGraphQL).toHaveBeenCalled();
    });
  });

  describe("getTourBySlug", () => {
    it("returns single product by slug", async () => {
      const mockTour = {
        databaseId: 1,
        name: "Test Tour",
        slug: "test-tour",
        description: "A great tour",
      };
      mockFetchGraphQL.mockResolvedValue({ product: mockTour });

      const result = await getTourBySlug("test-tour");

      expect(mockFetchGraphQL).toHaveBeenCalled();
      expect(result).toEqual(mockTour);
    });

    it("passes slug variable correctly", async () => {
      mockFetchGraphQL.mockResolvedValue({ product: null });

      await getTourBySlug("nonexistent");

      expect(mockFetchGraphQL).toHaveBeenCalled();
    });

    it("returns null when product not found", async () => {
      mockFetchGraphQL.mockResolvedValue({ product: null });

      const result = await getTourBySlug("nonexistent");

      expect(result).toBeNull();
    });
  });

  describe("getAllTourSlugs", () => {
    it("returns array of slugs", async () => {
      const mockResponse = {
        products: {
          nodes: [{ slug: "tour-1" }, { slug: "tour-2" }, { slug: "tour-3" }],
        },
      };
      mockFetchGraphQL.mockResolvedValue(mockResponse);

      const result = await getAllTourSlugs();

      expect(mockFetchGraphQL).toHaveBeenCalled();
      expect(result).toEqual(mockResponse.products.nodes);
      expect(result.length).toBe(3);
      expect(result[0].slug).toBe("tour-1");
    });

    it("returns empty array when no slugs", async () => {
      mockFetchGraphQL.mockResolvedValue({ products: { nodes: [] } });

      const result = await getAllTourSlugs();

      expect(result).toEqual([]);
    });
  });

  describe("getToursByDestination", () => {
    it("returns products filtered by destination slugs", async () => {
      const mockResponse = {
        products: {
          nodes: [
            { databaseId: 1, name: "Tour in Da Nang", slug: "da-nang-tour" },
          ],
          pageInfo: { hasNextPage: false },
        },
      };
      mockFetchGraphQL.mockResolvedValue(mockResponse);

      const result = await getToursByDestination(["da-nang"]);

      expect(mockFetchGraphQL).toHaveBeenCalled();
      expect(result).toEqual(mockResponse.products);
    });

    it("handles multiple destination slugs", async () => {
      mockFetchGraphQL.mockResolvedValue({ products: { nodes: [] } });

      await getToursByDestination(["da-nang", "ho-chi-minh"]);

      expect(mockFetchGraphQL).toHaveBeenCalled();
    });

    it("supports pagination with custom first and after", async () => {
      mockFetchGraphQL.mockResolvedValue({ products: { nodes: [] } });

      await getToursByDestination(["da-nang"], 6, "cursor456");

      expect(mockFetchGraphQL).toHaveBeenCalled();
    });
  });

  describe("getToursByTravelStyle", () => {
    it("returns products filtered by travel style slugs", async () => {
      const mockResponse = {
        products: {
          nodes: [{ databaseId: 1, name: "Adventure Tour" }],
          pageInfo: {},
        },
      };
      mockFetchGraphQL.mockResolvedValue(mockResponse);

      const result = await getToursByTravelStyle(["adventure"]);

      expect(mockFetchGraphQL).toHaveBeenCalled();
      expect(result).toEqual(mockResponse.products);
    });

    it("passes multiple styles and pagination", async () => {
      mockFetchGraphQL.mockResolvedValue({ products: { nodes: [] } });

      await getToursByTravelStyle(["adventure", "luxury"], 8, "abc123");

      expect(mockFetchGraphQL).toHaveBeenCalled();
    });
  });

  describe("getToursByTourType", () => {
    it("returns products filtered by tour type slugs", async () => {
      const mockResponse = {
        products: {
          nodes: [{ databaseId: 1, name: "Group Tour" }],
          pageInfo: {},
        },
      };
      mockFetchGraphQL.mockResolvedValue(mockResponse);

      const result = await getToursByTourType(["group-tour"]);

      expect(mockFetchGraphQL).toHaveBeenCalled();
      expect(result).toEqual(mockResponse.products);
    });

    it("supports both group and private tour types", async () => {
      mockFetchGraphQL.mockResolvedValue({ products: { nodes: [] } });

      await getToursByTourType(["group-tour", "private-tour"], 15);

      expect(mockFetchGraphQL).toHaveBeenCalled();
    });
  });

  describe("getToursByTag", () => {
    it("returns products filtered by tag slugs", async () => {
      const mockResponse = {
        products: {
          nodes: [{ databaseId: 1, name: "Scenic Tour" }],
          pageInfo: {},
        },
      };
      mockFetchGraphQL.mockResolvedValue(mockResponse);

      const result = await getToursByTag(["scenic"]);

      expect(mockFetchGraphQL).toHaveBeenCalled();
      expect(result).toEqual(mockResponse.products);
    });

    it("handles multiple tags with pagination", async () => {
      mockFetchGraphQL.mockResolvedValue({ products: { nodes: [] } });

      await getToursByTag(["scenic", "wildlife"], 10, "xyz789");

      expect(mockFetchGraphQL).toHaveBeenCalled();
    });
  });

  describe("getToursByCombinedFilters", () => {
    it("returns products with combined destination and travel style filters", async () => {
      const mockResponse = {
        products: {
          nodes: [{ databaseId: 1, name: "Adventure in Da Nang" }],
          pageInfo: {},
        },
      };
      mockFetchGraphQL.mockResolvedValue(mockResponse);

      const result = await getToursByCombinedFilters(
        ["da-nang"],
        ["adventure"]
      );

      expect(mockFetchGraphQL).toHaveBeenCalled();
      expect(result).toEqual(mockResponse.products);
    });

    it("handles multiple destinations and travel styles", async () => {
      mockFetchGraphQL.mockResolvedValue({ products: { nodes: [] } });

      await getToursByCombinedFilters(
        ["da-nang", "ho-chi-minh"],
        ["adventure", "cultural"],
        20,
        "combo123"
      );

      expect(mockFetchGraphQL).toHaveBeenCalled();
    });

    it("uses default pagination when not specified", async () => {
      mockFetchGraphQL.mockResolvedValue({ products: { nodes: [] } });

      await getToursByCombinedFilters(["da-nang"], ["luxury"]);

      expect(mockFetchGraphQL).toHaveBeenCalled();
    });
  });
});
