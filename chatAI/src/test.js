import { fetchProducts } from "./services/products.service.js";
import { writeFileSync } from "fs";
const products = await fetchProducts();
writeFileSync("products.json", JSON.stringify(products, null, 2));
console.log(products);
