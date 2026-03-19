import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getAllDestinations,
  getAllDestinationsFlat,
  getDestinationBySlug,
  getAllTourTypes,
  getAllTravelStyles,
  getAllProductTags,
  getTourFilterOptions,
} from "../taxonomy-service";

vi.mock("../../../../graphql/client", () => ({
  fetchGraphQL: vi.fn(),
}));

import { fetchGraphQL } from "../../../../graphql/client";
const mockFetchGraphQL = vi.mocked(fetchGraphQL);

describe("taxonomy-service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAllDestinations", () => {
    it("returns hierarchical destination tree", async () => {
      const mockDestinations = [
        {
          databaseId: 1,
          name: "Vietnam",
          slug: "vietnam",
          children: [{ databaseId: 2, name: "Da Nang", slug: "da-nang" }],
        },
      ];
      mockFetchGraphQL.mockResolvedValue({
        allDestination: { nodes: mockDestinations },
      });

      const result = await getAllDestinations();

      expect(mockFetchGraphQL).toHaveBeenCalled();
      expect(result).toEqual(mockDestinations);
      expect(result[0].children).toBeDefined();
    });

    it("respects hideEmpty parameter", async () => {
      mockFetchGraphQL.mockResolvedValue({
        allDestination: { nodes: [] },
      });

      await getAllDestinations(true);

      expect(mockFetchGraphQL).toHaveBeenCalled();
    });

    it("defaults hideEmpty to false", async () => {
      mockFetchGraphQL.mockResolvedValue({
        allDestination: { nodes: [] },
      });

      await getAllDestinations();

      expect(mockFetchGraphQL).toHaveBeenCalled();
    });

    it("returns empty array when no destinations", async () => {
      mockFetchGraphQL.mockResolvedValue({
        allDestination: { nodes: [] },
      });

      const result = await getAllDestinations();

      expect(result).toEqual([]);
    });

    it("extracts destinations from allDestination nodes", async () => {
      const mockDestinations = [
        { databaseId: 1, name: "Cambodia", slug: "cambodia" },
        { databaseId: 2, name: "Thailand", slug: "thailand" },
      ];
      mockFetchGraphQL.mockResolvedValue({
        allDestination: {
          nodes: mockDestinations,
          pageInfo: {},
        },
      });

      const result = await getAllDestinations();

      expect(result).toEqual(mockDestinations);
      expect(result).not.toHaveProperty("pageInfo");
    });
  });

  describe("getAllDestinationsFlat", () => {
    it("returns flat destination list with parent info", async () => {
      const mockDestinations = [
        {
          databaseId: 1,
          name: "Vietnam",
          slug: "vietnam",
          parentDatabaseId: null,
        },
        {
          databaseId: 2,
          name: "Da Nang",
          slug: "da-nang",
          parentDatabaseId: 1,
        },
      ];
      mockFetchGraphQL.mockResolvedValue({
        allDestination: { nodes: mockDestinations },
      });

      const result = await getAllDestinationsFlat();

      expect(mockFetchGraphQL).toHaveBeenCalled();
      expect(result).toEqual(mockDestinations);
      expect(result[1].parentDatabaseId).toBe(1);
    });

    it("respects hideEmpty parameter", async () => {
      mockFetchGraphQL.mockResolvedValue({
        allDestination: { nodes: [] },
      });

      await getAllDestinationsFlat(true);

      expect(mockFetchGraphQL).toHaveBeenCalled();
    });

    it("returns all destinations in flat structure", async () => {
      const mockDestinations = [
        { databaseId: 1, name: "Asia", slug: "asia", parentDatabaseId: null },
        {
          databaseId: 2,
          name: "Southeast Asia",
          slug: "se-asia",
          parentDatabaseId: 1,
        },
        {
          databaseId: 3,
          name: "Mekong Region",
          slug: "mekong",
          parentDatabaseId: 2,
        },
      ];
      mockFetchGraphQL.mockResolvedValue({
        allDestination: { nodes: mockDestinations },
      });

      const result = await getAllDestinationsFlat();

      expect(result.length).toBe(3);
      expect(result[2].parentDatabaseId).toBe(2);
    });
  });

  describe("getDestinationBySlug", () => {
    it("returns destination with tours and posts", async () => {
      const mockDestination = {
        databaseId: 1,
        name: "Da Nang",
        slug: "da-nang",
        description: "Coastal city",
        products: { nodes: [] },
        posts: { nodes: [] },
      };
      mockFetchGraphQL.mockResolvedValue({
        destination: mockDestination,
      });

      const result = await getDestinationBySlug("da-nang");

      expect(mockFetchGraphQL).toHaveBeenCalled();
      expect(result).toEqual(mockDestination);
      expect(result.products).toBeDefined();
      expect(result.posts).toBeDefined();
    });

    it("supports custom product and post limits", async () => {
      mockFetchGraphQL.mockResolvedValue({
        destination: { databaseId: 1, slug: "da-nang" },
      });

      await getDestinationBySlug("da-nang", 24, 12);

      expect(mockFetchGraphQL).toHaveBeenCalled();
    });

    it("uses default limits when not specified", async () => {
      mockFetchGraphQL.mockResolvedValue({
        destination: { databaseId: 1, slug: "da-nang" },
      });

      await getDestinationBySlug("da-nang");

      expect(mockFetchGraphQL).toHaveBeenCalled();
    });

    it("returns null when destination not found", async () => {
      mockFetchGraphQL.mockResolvedValue({
        destination: null,
      });

      const result = await getDestinationBySlug("nonexistent");

      expect(result).toBeNull();
    });
  });

  describe("getAllTourTypes", () => {
    it("returns all tour types", async () => {
      const mockTourTypes = [
        { databaseId: 1, name: "Group Tour", slug: "group-tour" },
        { databaseId: 2, name: "Private Tour", slug: "private-tour" },
      ];
      mockFetchGraphQL.mockResolvedValue({
        allPaTourType: { nodes: mockTourTypes },
      });

      const result = await getAllTourTypes();

      expect(mockFetchGraphQL).toHaveBeenCalled();
      expect(result).toEqual(mockTourTypes);
      expect(result.length).toBe(2);
    });

    it("extracts tour types from allPaTourType", async () => {
      const mockTypes = [{ databaseId: 1, name: "Group", slug: "group" }];
      mockFetchGraphQL.mockResolvedValue({
        allPaTourType: { nodes: mockTypes, pageInfo: {} },
      });

      const result = await getAllTourTypes();

      expect(result).toEqual(mockTypes);
      expect(result).not.toHaveProperty("pageInfo");
    });

    it("returns empty array when no tour types", async () => {
      mockFetchGraphQL.mockResolvedValue({
        allPaTourType: { nodes: [] },
      });

      const result = await getAllTourTypes();

      expect(result).toEqual([]);
    });
  });

  describe("getAllTravelStyles", () => {
    it("returns all travel styles", async () => {
      const mockStyles = [
        { databaseId: 1, name: "Adventure", slug: "adventure" },
        { databaseId: 2, name: "Cultural", slug: "cultural" },
        { databaseId: 3, name: "Luxury", slug: "luxury" },
      ];
      mockFetchGraphQL.mockResolvedValue({
        allPaTravelStyle: { nodes: mockStyles },
      });

      const result = await getAllTravelStyles();

      expect(mockFetchGraphQL).toHaveBeenCalled();
      expect(result).toEqual(mockStyles);
      expect(result.length).toBe(3);
    });

    it("extracts travel styles from allPaTravelStyle", async () => {
      const mockStyles = [{ databaseId: 1, name: "Budget", slug: "budget" }];
      mockFetchGraphQL.mockResolvedValue({
        allPaTravelStyle: { nodes: mockStyles, pageInfo: {} },
      });

      const result = await getAllTravelStyles();

      expect(result).toEqual(mockStyles);
    });

    it("returns empty array when no styles", async () => {
      mockFetchGraphQL.mockResolvedValue({
        allPaTravelStyle: { nodes: [] },
      });

      const result = await getAllTravelStyles();

      expect(result).toEqual([]);
    });
  });

  describe("getAllProductTags", () => {
    it("returns all product tags", async () => {
      const mockTags = [
        { databaseId: 1, name: "Scenic", slug: "scenic" },
        { databaseId: 2, name: "Wildlife", slug: "wildlife" },
      ];
      mockFetchGraphQL.mockResolvedValue({
        productTags: { nodes: mockTags },
      });

      const result = await getAllProductTags();

      expect(mockFetchGraphQL).toHaveBeenCalled();
      expect(result).toEqual(mockTags);
      expect(result.length).toBe(2);
    });

    it("extracts tags from productTags nodes", async () => {
      const mockTags = [{ databaseId: 1, name: "Relaxing", slug: "relaxing" }];
      mockFetchGraphQL.mockResolvedValue({
        productTags: { nodes: mockTags, pageInfo: {} },
      });

      const result = await getAllProductTags();

      expect(result).toEqual(mockTags);
      expect(result).not.toHaveProperty("pageInfo");
    });

    it("returns empty array when no tags", async () => {
      mockFetchGraphQL.mockResolvedValue({
        productTags: { nodes: [] },
      });

      const result = await getAllProductTags();

      expect(result).toEqual([]);
    });
  });

  describe("getTourFilterOptions", () => {
    it("returns all filter options in one response", async () => {
      const mockFilterOptions = {
        allDestination: {
          nodes: [{ databaseId: 1, name: "Vietnam", slug: "vietnam" }],
        },
        allPaTourType: {
          nodes: [{ databaseId: 1, name: "Group", slug: "group" }],
        },
        allPaTravelStyle: {
          nodes: [{ databaseId: 1, name: "Adventure", slug: "adventure" }],
        },
        productTags: {
          nodes: [{ databaseId: 1, name: "Scenic", slug: "scenic" }],
        },
      };
      mockFetchGraphQL.mockResolvedValue(mockFilterOptions);

      const result = await getTourFilterOptions();

      expect(mockFetchGraphQL).toHaveBeenCalled();
      expect(result).toEqual(mockFilterOptions);
      expect(result.allDestination).toBeDefined();
      expect(result.allPaTourType).toBeDefined();
      expect(result.allPaTravelStyle).toBeDefined();
      expect(result.productTags).toBeDefined();
    });

    it("includes all filter types in response", async () => {
      const mockFilterOptions = {
        allDestination: { nodes: [] },
        allPaTourType: { nodes: [] },
        allPaTravelStyle: { nodes: [] },
        productTags: { nodes: [] },
      };
      mockFetchGraphQL.mockResolvedValue(mockFilterOptions);

      const result = await getTourFilterOptions();

      expect(result.allDestination.nodes).toEqual([]);
      expect(result.allPaTourType.nodes).toEqual([]);
      expect(result.allPaTravelStyle.nodes).toEqual([]);
      expect(result.productTags.nodes).toEqual([]);
    });

    it("returns complete filter structure for UI consumption", async () => {
      const mockFilterOptions = {
        allDestination: {
          nodes: [
            { databaseId: 1, name: "Vietnam", slug: "vietnam" },
            { databaseId: 2, name: "Cambodia", slug: "cambodia" },
          ],
        },
        allPaTourType: {
          nodes: [
            { databaseId: 1, name: "Group", slug: "group" },
            { databaseId: 2, name: "Private", slug: "private" },
          ],
        },
        allPaTravelStyle: {
          nodes: [
            { databaseId: 1, name: "Adventure", slug: "adventure" },
            { databaseId: 2, name: "Luxury", slug: "luxury" },
            { databaseId: 3, name: "Cultural", slug: "cultural" },
          ],
        },
        productTags: {
          nodes: [{ databaseId: 1, name: "Scenic", slug: "scenic" }],
        },
      };
      mockFetchGraphQL.mockResolvedValue(mockFilterOptions);

      const result = await getTourFilterOptions();

      expect(result.allDestination.nodes.length).toBe(2);
      expect(result.allPaTourType.nodes.length).toBe(2);
      expect(result.allPaTravelStyle.nodes.length).toBe(3);
      expect(result.productTags.nodes.length).toBe(1);
    });
  });
});
