import { pool } from './pool.js';

/**
 * Execute a callback inside an atomic MySQL transaction.
 * Automatically commits on success and rolls back on any error.
 * 
 * @param {Function} callback - (connection) => Promise<any>
 * @returns {Promise<any>}
 */
export async function withTransaction(callback) {
  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
