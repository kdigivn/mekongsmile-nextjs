import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getSiteSettings,
  getLayoutData,
  getAllMenus,
  getMenuByLocation,
} from "../site-service";

vi.mock("../../../../graphql/client", () => ({
  fetchGraphQL: vi.fn(),
}));

import { fetchGraphQL } from "../../../../graphql/client";
const mockFetchGraphQL = vi.mocked(fetchGraphQL);

describe("site-service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getSiteSettings", () => {
    it("returns general site settings", async () => {
      const mockSettings = {
        title: "Mekong Smile",
        description: "Travel tours",
        url: "https://mekongsmile.com",
        language: "en",
      };
      mockFetchGraphQL.mockResolvedValue({
        generalSettings: mockSettings,
      });

      const result = await getSiteSettings();

      expect(mockFetchGraphQL).toHaveBeenCalled();
      expect(result).toEqual(mockSettings);
    });

    it("extracts generalSettings from response", async () => {
      const mockSettings = {
        title: "Test Site",
        description: "Test Description",
        url: "https://test.com",
      };
      mockFetchGraphQL.mockResolvedValue({
        generalSettings: mockSettings,
        otherData: "should be ignored",
      });

      const result = await getSiteSettings();

      expect(result).toEqual(mockSettings);
      expect(result).not.toHaveProperty("otherData");
    });

    it("includes all expected setting fields", async () => {
      const mockSettings = {
        title: "Site Title",
        description: "Site Description",
        url: "https://example.com",
        language: "vi",
        timezone: "Asia/Ho_Chi_Minh",
      };
      mockFetchGraphQL.mockResolvedValue({
        generalSettings: mockSettings,
      });

      const result = await getSiteSettings();

      expect(result.title).toBe("Site Title");
      expect(result.description).toBe("Site Description");
      expect(result.url).toBe("https://example.com");
      expect(result.language).toBe("vi");
      expect(result.timezone).toBe("Asia/Ho_Chi_Minh");
    });
  });

  describe("getLayoutData", () => {
    it("returns full layout data response", async () => {
      const mockLayoutData = {
        generalSettings: {
          title: "Site",
          url: "https://site.com",
        },
        menus: {
          nodes: [
            {
              databaseId: 1,
              name: "Main Menu",
              slug: "main-menu",
              menuItems: [],
            },
          ],
        },
      };
      mockFetchGraphQL.mockResolvedValue(mockLayoutData);

      const result = await getLayoutData();

      expect(mockFetchGraphQL).toHaveBeenCalled();
      expect(result).toEqual(mockLayoutData);
      expect(result.generalSettings).toBeDefined();
      expect(result.menus).toBeDefined();
    });

    it("includes settings and all menus in response", async () => {
      const mockLayoutData = {
        generalSettings: {
          title: "Mekong Smile",
          description: "Travel",
        },
        menus: {
          nodes: [
            { databaseId: 1, name: "Primary", slug: "primary" },
            { databaseId: 2, name: "Secondary", slug: "secondary" },
            { databaseId: 3, name: "Footer", slug: "footer" },
          ],
        },
      };
      mockFetchGraphQL.mockResolvedValue(mockLayoutData);

      const result = await getLayoutData();

      expect(result.generalSettings.title).toBe("Mekong Smile");
      expect(result.menus.nodes).toHaveLength(3);
      expect(result.menus.nodes[0].name).toBe("Primary");
    });
  });

  describe("getAllMenus", () => {
    it("returns all menu nodes", async () => {
      const mockMenus = [
        {
          databaseId: 1,
          name: "Primary Menu",
          slug: "primary-menu",
          menuItems: { nodes: [] },
        },
        {
          databaseId: 2,
          name: "Secondary Menu",
          slug: "secondary-menu",
          menuItems: { nodes: [] },
        },
      ];
      mockFetchGraphQL.mockResolvedValue({
        menus: { nodes: mockMenus },
      });

      const result = await getAllMenus();

      expect(mockFetchGraphQL).toHaveBeenCalled();
      expect(result).toEqual(mockMenus);
      expect(result.length).toBe(2);
    });

    it("extracts nodes from menus response", async () => {
      const mockNodes = [
        { databaseId: 1, name: "Menu 1" },
        { databaseId: 2, name: "Menu 2" },
      ];
      mockFetchGraphQL.mockResolvedValue({
        menus: {
          nodes: mockNodes,
          pageInfo: {},
        },
      });

      const result = await getAllMenus();

      expect(result).toEqual(mockNodes);
      expect(result).not.toHaveProperty("pageInfo");
    });

    it("returns empty array when no menus", async () => {
      mockFetchGraphQL.mockResolvedValue({ menus: { nodes: [] } });

      const result = await getAllMenus();

      expect(result).toEqual([]);
    });

    it("includes menu items with nested structure", async () => {
      const mockMenus = [
        {
          databaseId: 1,
          name: "Main",
          slug: "main",
          menuItems: {
            nodes: [
              { label: "Home", url: "/" },
              { label: "About", url: "/about" },
            ],
          },
        },
      ];
      mockFetchGraphQL.mockResolvedValue({ menus: { nodes: mockMenus } });

      const result = await getAllMenus();

      expect(result[0].menuItems.nodes).toHaveLength(2);
      expect(result[0].menuItems.nodes[0].label).toBe("Home");
    });
  });

  describe("getMenuByLocation", () => {
    it("returns menu by location - PRIMARY", async () => {
      const mockMenu = {
        databaseId: 1,
        name: "Primary Menu",
        slug: "primary-menu",
        menuItems: { nodes: [] },
      };
      mockFetchGraphQL.mockResolvedValue({
        menus: { nodes: [mockMenu] },
      });

      const result = await getMenuByLocation("PRIMARY");

      expect(mockFetchGraphQL).toHaveBeenCalled();
      expect(result).toEqual(mockMenu);
    });

    it("returns menu by location - SECONDARY", async () => {
      const mockMenu = {
        databaseId: 2,
        name: "Secondary Menu",
        slug: "secondary-menu",
      };
      mockFetchGraphQL.mockResolvedValue({
        menus: { nodes: [mockMenu] },
      });

      const result = await getMenuByLocation("SECONDARY");

      expect(mockFetchGraphQL).toHaveBeenCalled();
      expect(result).toEqual(mockMenu);
    });

    it("returns menu by location - TOP_BAR_NAV", async () => {
      const mockMenu = {
        databaseId: 3,
        name: "Top Bar Menu",
        slug: "top-bar-menu",
      };
      mockFetchGraphQL.mockResolvedValue({
        menus: { nodes: [mockMenu] },
      });

      const result = await getMenuByLocation("TOP_BAR_NAV");

      expect(mockFetchGraphQL).toHaveBeenCalled();
      expect(result).toEqual(mockMenu);
    });

    it("returns null when menu location not found", async () => {
      mockFetchGraphQL.mockResolvedValue({
        menus: { nodes: [] },
      });

      const result = await getMenuByLocation("NONEXISTENT");

      expect(result).toBeNull();
    });

    it("returns first menu when multiple exist", async () => {
      const mockMenu1 = { databaseId: 1, name: "Menu 1" };
      const mockMenu2 = { databaseId: 2, name: "Menu 2" };
      mockFetchGraphQL.mockResolvedValue({
        menus: { nodes: [mockMenu1, mockMenu2] },
      });

      const result = await getMenuByLocation("PRIMARY");

      expect(result).toEqual(mockMenu1);
    });

    it("passes location variable correctly", async () => {
      mockFetchGraphQL.mockResolvedValue({ menus: { nodes: [] } });

      await getMenuByLocation("CUSTOM_LOCATION");

      expect(mockFetchGraphQL).toHaveBeenCalled();
    });
  });
});
