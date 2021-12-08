/* eslint-disable */
const isDevelopment: boolean = process.env.NODE_ENV !== "production";

const port: number = 8080;
const protocol: string = isDevelopment ? "http" : "https";
const domain: string = isDevelopment ? `localhost:${port}` : process.env.PRODUCTION_DOMAIN as string;

type ConfigValue = number | string | boolean;

interface NetworkConfig {
	PORT: number
	PROTOCOL: string
	DOMAIN: string
}

interface Config extends NetworkConfig {
	[key: string]: ConfigValue
}

const Config: Config = {
	// network
	PORT: port,
	PROTOCOL: protocol,
	DOMAIN: domain,

	// common
	FIREBASE_CONFIG: process.env.FIREBASE_CONFIG as string,
	ADMIN_TOKEN: process.env.ADMIN_TOKEN as string
};

export default Config;