"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fs_1 = __importDefault(require("node:fs"));
function generateTableFromJSON(jsonFilePath, outputFilePath) {
    node_fs_1.default.readFile(jsonFilePath, "utf8", (err, rawData) => {
        try {
            const response = JSON.parse(rawData);
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
            node_fs_1.default.writeFileSync(outputFilePath, csvContent);
            console.log("CSV file generated successfully:", outputFilePath);
        }
        catch (error) {
            console.error("Error processing JSON:", error);
        }
    });
}
const jsonFilePath = "C:\\Users\\smith\\Downloads\\menu.json";
const outputFilePath = "C:\\Users\\smith\\Downloads\\menu_export.csv";
generateTableFromJSON(jsonFilePath, outputFilePath);
