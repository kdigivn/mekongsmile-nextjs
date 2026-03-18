import { describe, it, expect, vi, beforeEach } from "vitest";
import { getTourConstant } from "../options-service";

vi.mock("../../../../graphql/client", () => ({
  fetchGraphQL: vi.fn(),
}));

import { fetchGraphQL } from "../../../../graphql/client";
const mockFetchGraphQL = vi.mocked(fetchGraphQL);

describe("options-service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getTourConstant", () => {
    it("returns tour constant from ACF options page", async () => {
      const mockTourConstant = {
        whyChooseUs: [
          { title: "Expert Guides", description: "Experienced local guides" },
        ],
        highlights: ["Scenic", "Cultural"],
      };
      mockFetchGraphQL.mockResolvedValue({
        tourConstantOptions: {
          tourConstant: mockTourConstant,
        },
      });

      const result = await getTourConstant();

      expect(mockFetchGraphQL).toHaveBeenCalled();
      expect(result).toEqual(mockTourConstant);
    });

    it("extracts tourConstant from tourConstantOptions", async () => {
      const mockConstant = {
        description: "Test constant",
        value: 123,
      };
      mockFetchGraphQL.mockResolvedValue({
        tourConstantOptions: {
          tourConstant: mockConstant,
          otherField: "should be ignored",
        },
      });

      const result = await getTourConstant();

      expect(result).toEqual(mockConstant);
      expect(result).not.toHaveProperty("otherField");
    });

    it("returns whyChooseUs section when present", async () => {
      const mockConstant = {
        whyChooseUs: [
          {
            title: "Professional Team",
            description: "Dedicated professionals",
          },
          {
            title: "Best Prices",
            description: "Competitive pricing",
          },
        ],
      };
      mockFetchGraphQL.mockResolvedValue({
        tourConstantOptions: {
          tourConstant: mockConstant,
        },
      });

      const result = await getTourConstant();

      expect(result.whyChooseUs).toBeDefined();
      expect(result.whyChooseUs.length).toBe(2);
      expect(result.whyChooseUs[0].title).toBe("Professional Team");
    });

    it("returns other ACF fields", async () => {
      const mockConstant = {
        aboutUsText: "About the company",
        testimonials: [{ name: "John", text: "Great tour" }],
        contactInfo: {
          email: "info@example.com",
          phone: "+84123456789",
        },
      };
      mockFetchGraphQL.mockResolvedValue({
        tourConstantOptions: {
          tourConstant: mockConstant,
        },
      });

      const result = await getTourConstant();

      expect(result.aboutUsText).toBe("About the company");
      expect(result.testimonials).toBeDefined();
      expect(result.contactInfo.email).toBe("info@example.com");
    });

    it("handles empty tour constant", async () => {
      const mockConstant = {};
      mockFetchGraphQL.mockResolvedValue({
        tourConstantOptions: {
          tourConstant: mockConstant,
        },
      });

      const result = await getTourConstant();

      expect(result).toEqual({});
    });

    it("returns complex nested ACF structure", async () => {
      const mockConstant = {
        sections: [
          {
            title: "Section 1",
            content: "Content here",
            images: [
              { src: "image1.jpg", alt: "Image 1" },
              { src: "image2.jpg", alt: "Image 2" },
            ],
          },
        ],
        metadata: {
          created: "2024-01-01",
          updated: "2024-03-01",
          author: "Admin",
        },
      };
      mockFetchGraphQL.mockResolvedValue({
        tourConstantOptions: {
          tourConstant: mockConstant,
        },
      });

      const result = await getTourConstant();

      expect(result.sections[0].images.length).toBe(2);
      expect(result.metadata.author).toBe("Admin");
    });

    it("calls fetchGraphQL with GET_TOUR_CONSTANT query", async () => {
      mockFetchGraphQL.mockResolvedValue({
        tourConstantOptions: {
          tourConstant: {},
        },
      });

      await getTourConstant();

      expect(mockFetchGraphQL).toHaveBeenCalledTimes(1);
      const callArgs = mockFetchGraphQL.mock.calls[0];
      expect(callArgs).toHaveLength(1); // Only query, no variables
    });

    it("returns consistent structure on multiple calls", async () => {
      const mockConstant = {
        title: "Our Tours",
        description: "Best tours in Mekong",
      };
      mockFetchGraphQL.mockResolvedValue({
        tourConstantOptions: {
          tourConstant: mockConstant,
        },
      });

      const result1 = await getTourConstant();
      const result2 = await getTourConstant();

      expect(result1).toEqual(result2);
      expect(mockFetchGraphQL).toHaveBeenCalledTimes(2);
    });
  });
});
