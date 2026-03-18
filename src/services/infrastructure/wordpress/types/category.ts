export type Category = {
  categoryId: number;
  name: string;
  parent: {
    node: {
      name: string;
      categoryId: number;
    };
  };
  slug: string;
  uri: string;
  children: {
    nodes: [
      {
        categoryId: number;
        name: string;
        slug: string;
      },
    ];
  };
};

export type CategoriesResponse = {
  categories: { nodes: Category[] };
};
