import fs from "node:fs";
export type DietaryInfo = {
  allergens?: Allergen[];
  dietary?: Dietary[];
  spiciness?: Spiciness;
};

export type Allergen = "dairy" | "nuts" | "gluten";

export type Dietary = "vegetarian";

export type Spiciness = "mild_spicy" | "spicy";

interface I18nStrings {
  es: string;
  en: string;
  fr: string;
}

export interface Menu {
  id: number;
  name: string;
  description: string;
  enable: boolean;
  categories: Category[];
}

export interface Category {
  id: number;
  name: string;
  name_i18n?: I18nStrings;
  description: string;
  enable: boolean;
  index: number;
  category_type: "mixto" | "almuerzos" | "desayunos";
  show_image: boolean;
  products: Product[];
}

export interface Product {
  id: number;
  name: string;
  display_name?: string;
  display_name_i18n?: I18nStrings;
  description?: string;
  description_i18n?: I18nStrings;
  price: number;
  discount_id: number | null;
  discount: null;
  unit: string;
  enabled: boolean;
  stock: boolean;
  image_url?: string | null;
  discount_percentage: number | null;
  dietary_info?: DietaryInfo;
  is_new?: boolean;
  is_featured?: boolean;
}

interface ApiResponse {
  data: Menu[];
  message: string;
}

function generateTableFromJSON(jsonFilePath: string, outputFilePath: string) {
  fs.readFile(jsonFilePath, "utf8", (err, rawData) => {
    try {
      const response: ApiResponse = JSON.parse(rawData);
      const menus = response.data;

      const headers = [
        // Menu fields
        "menu_id",
        "menu_name",
        "menu_enable",
        // Category fields
        "category_id",
        "category_name",
        "category_name_es",
        "category_name_en",
        "category_name_fr",
        "category_enable",
        "category_index",
        "category_type",
        "category_show_image",
        // Product fields
        "product_id",
        "product_name",
        "display_name",
        "display_name_es",
        "display_name_en",
        "display_name_fr",
        "description",
        "description_es",
        "description_en",
        "description_fr",
        "price",
        "enabled",
        "stock",
        "image_url",
        "unit",
        "discount_id",
        "discount_percentage",
        "is_new",
        "is_featured",
        // Dietary Info
        "allergens",
        "dietary",
        "spiciness",
      ];

      let csvContent = headers.join(";") + "\n";

      menus.forEach((menu) => {
        menu.categories.forEach((category) => {
          category.products.forEach((product) => {
            const row = [
              // Menu data
              menu.id,
              menu.name,
              menu.enable,
              // Category data
              category.id,
              category.name,
              category.name_i18n?.es || category.name,
              category.name_i18n?.en || "",
              category.name_i18n?.fr || "",
              category.enable,
              category.index,
              category.category_type,
              category.show_image,
              // Product data
              product.id,
              product.name,
              product.display_name || "",
              product.display_name_i18n?.es || product.display_name || "",
              product.display_name_i18n?.en || "",
              product.display_name_i18n?.fr || "",
              product.description || "",
              product.description_i18n?.es || product.description || "",
              product.description_i18n?.en || "",
              product.description_i18n?.fr || "",
              product.price,
              product.enabled,
              product.stock,
              product.image_url || "",
              product.unit || "",
              product.discount_id || "",
              product.discount_percentage || "",
              product.is_new || false,
              product.is_featured || false,
              // Dietary Info
              JSON.stringify(product.dietary_info?.allergens || []),
              JSON.stringify(product.dietary_info?.dietary || []),
              product.dietary_info?.spiciness || "",
            ];
            csvContent += row.join(";") + "\n";
          });
        });
      });

      fs.writeFileSync(outputFilePath, csvContent);
      console.log("CSV file generated successfully:", outputFilePath);
    } catch (error) {
      console.error("Error processing JSON:", error);
    }
  });
}

const jsonFilePath = "C:\\Users\\smith\\Downloads\\menu.json";
const outputFilePath = "C:\\Users\\smith\\Downloads\\menu_export.csv";

generateTableFromJSON(jsonFilePath, outputFilePath);