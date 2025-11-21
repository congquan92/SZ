import { fetchProducts } from "./products.service.js";
import { writeFileSync } from "fs";
const products = await fetchProducts();
console.log(products);
