import { ChromaClient, OpenAIEmbeddingFunction } from "chromadb";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();
const client = new ChromaClient("http://localhost:8000");

/**
 * Creates a new collection
 * @param {string} name
 * @returns {Promise<import('chromadb').Collection>} The created collection
 */
async function getCollection(name = "my_collection") {
  const embedder = new OpenAIEmbeddingFunction(process.env.OPENAI_API_KEY);
  const collection = await client.getCollection(name, embedder);
  console.log("✅ Successfully got the collection");
  return collection;
}

/**
 * Parses a CSV file
 * @param {string} filename
 * @returns {Promise<Array<Object>>} The parsed CSV file
 */
function parseCsvFile(filename) {
  return new Promise((resolve, reject) => {
    const results = [];

    fs.createReadStream(filename)
      .pipe(csv())
      .on("data", (data) => {
        results.push(data);
      })
      .on("end", () => {
        console.log("✅ Successfully parsed CSV file");
        resolve(results);
      })
      .on("error", (error) => {
        reject(error);
      });
  });
}

/**
 * Cleans a value
 * @param {string} value
 * @returns {string} The cleaned value
 */
function cleanValue(value) {
  return value.replace(/(\n|●|[0-9])/g, "").trim();
}

/**
 * Slugifies a value
 * @param {string} value
 * @returns {string} The slugified value
 */
function slugify(value) {
  return value.replace(/[^a-zA-Z]/g, "-").toLowerCase();
}

/**
 * Loads data from a JSON file
 * @param {string} file The JSON file to load
 * @returns {Promise<Array<{id: string, value: string}>>} The loaded data
 */
async function loadData(file = "./data.json") {
  const rawData = fs.readFileSync(file, "utf8");
  const jsonData = JSON.parse(rawData);
  const data = jsonData.values.map(([group, exercise], i) => {
    return {
      id: slugify(exercise) + "-" + i,
      value: cleanValue(`Muscle group: ${group} - Exercise: ${exercise}`),
    };
  });
  console.log(`✅ Successfully loaded ${data.length} data points`);
  return data;
}

/**
 * Adds data to a collection
 * @param {Array<{id: string, value: string}>} data The data to add
 * @param {import('chromadb').Collection} collection The collection to add the data to
 * @returns {Promise<void>}
 */
async function addDataToCollection(data, collection) {
  // Split the data into chunks of 400
  const chunks = [];
  for (let i = 0; i < data.length; i += 400) {
    chunks.push(data.slice(i, i + 400));
  }

  // Add the data to the collection
  for (const chunk of chunks) {
    await collection.add(
      chunk.map(({ id }) => id),
      undefined,
      undefined,
      chunk.map(({ value }) => value)
    );
    console.log(`✅ Successfully added ${chunk.length} data points`);
  }
  console.log("✅ Successfully added all data points to collection");
}

/**
 * Queries a collection
 * @param {string} query The query to run
 * @param {import('chromadb').Collection} collection
 * @returns
 */
async function queryCollection(query, collection) {
  return await collection.query(undefined, 10, undefined, query);
}

let collection = await getCollection();
console.log("Number of items in collection", await collection.count());

// Disable this if you have already added data to the collection
const data = await loadData();
await addDataToCollection(data, collection);

const result = await queryCollection("bench press", collection);
console.log(result);
