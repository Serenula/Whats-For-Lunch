import axios from "axios";

const AIRTABLE_API_KEY = import.meta.env.VITE_AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = import.meta.env.VITE_AIRTABLE_BASE_ID;
const AIRTABLE_TABLE_NAME = import.meta.env.VITE_AIRTABLE_TABLE_NAME;
const AIRTABLE_API_URL = import.meta.env.VITE_AIRTABLE_API_URL;

const airtableAxios = axios.create({
  baseURL: `${AIRTABLE_API_URL}/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`,
  headers: {
    Authorization: `Bearer ${AIRTABLE_API_KEY}`,
    "Content-Type": "application/json",
  },
});

const getRecords = async () => {
  try {
    const res = await airtableAxios.get("/");
    return res.data;
  } catch (error) {
    console.error("Error fetching records:", error);
    throw error;
  }
};

const createRecord = async (data) => {
  try {
    const res = await airtableAxios.post("/", { fields: data });
    return res.data;
  } catch (error) {
    console.error("Error creating record:", error);
    throw error;
  }
};

const updateRecord = async (records) => {
  try {
    const res = await airtableAxios.patch("/", { records });
    console.log("Update response:", res.data); // Log successful response for debugging
    return res.data;
  } catch (error) {
    console.error("Error updating record:", error);
    throw error;
  }
};

const deleteRecord = async (recordId) => {
  try {
    const res = await airtableAxios.delete(`/${recordId}`);
    return res.data;
  } catch (error) {
    console.error("Error deleting record:", error);
    throw error;
  }
};

export default { getRecords, createRecord, updateRecord, deleteRecord };
