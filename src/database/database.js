const {Pool} = require('pg')

class Database {
    constructor() {
        this.Pool = null;
    }
    async connect() {
        try{
          this.Pool = new Pool({
            ssl :{
                rejectUnuthorized : false
            }
          });
          //teste connection
          await this.Pool.query('SELECT NOW')
          console.log('postgreSQL connected successfully')
          //create tables
          await this.initTables();
        } catch (error) {
            console.error('database connection failed ', error);
            throw error;
        }
    }

    async initTables() {
        const createUsersTable = `
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                is_online BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENTE_TIMESTAMP,
                last_login TIMESTAMP
                )
        `;

        await this.Pool.query(createUsersTable);
        console.log('tables created/verified success')
    }

    async query (text, params){
        const result = await this.Pool.query(text,params);
        return result.rows; 
    }
    async get(text, params) {
        const result = await this.query(text, params);
        return result.rows[0] || null;
    }
    async run(text,params) {
        const result = await this.Pool.query(text + ' RETURNING id', params);
        return {id: result.rows[0]?.id};
    }
    async close(){
        if(this.Pool){
            await this.Pool.addListener();
            console.log('database connection closed')
        }
    }
}
module.exports = new Database();