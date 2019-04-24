#!/usr/bin/env node

const fs = require("fs");
const nodePath = require("path");
const he = require("he");
const program = require("commander");
const puppeteer = require("puppeteer");
const ejs = require("ejs");
const smartquotes = require("smartquotes");
const fonts = require("twitter-caption-fonts");

const TEMPLATE = `${__dirname}/template.ejs`;

// prettier-ignore
program
	.version("0.1.0")
	.option("-i, --input-image <path>", "path to input image")
	.option("-o, --output-image <path>", "path to output image")
	.option("-t, --text <text>", "text to add to the input image; if left unspecified, twitter-caption will read from stdin.")
	.option("-w, --width <width>", "the width (in pixels) of the image to output, 1024 by default")
	.parse(process.argv);

const width = parseInt(program.width) || 1024;

const die = error => {
	error ? console.error(`error: ${error}`) : program.outputHelp();
	process.exit(1);
};

const handleFileError = (error, path) => {
	if (error.code === "EISDIR") {
		die(`"${path}" is a directory`);
	} else if (error.code === "EACCES") {
		die(`couldn't write to "${path}"`);
	} else if (error.code === "ENOENT") {
		die(`couldn't read from ${path}`);
	}
	return false;
};

const renderTemplate = async (template, data) => {
	return await new Promise((resolve, reject) => {
		ejs.renderFile(template, data, {}, (error, rendered) => {
			error ? reject(error) : resolve(rendered);
		});
	});
};

const screenshot = async (html, path) => {
	const browser = await puppeteer.launch();
	const page = await browser.newPage();
	await page.setViewport({ width, height: 1 });
	await page.setContent(html);
	try {
		fs.mkdirSync(nodePath.dirname(path));
	} catch (error) {
		if (error.code !== "EEXIST") {
			throw error;
		}
	}
	try {
		try {
			await page.screenshot({ path, fullPage: true });
		} catch (error) {
			if (error.message.includes("Unsupported screenshot mime type")) {
				await page.screenshot({ path, fullPage: true, type: "png" });
			} else throw error;
		}
	} catch (error) {
		handleFileError(error, path);
		throw error;
	}
	await browser.close();
};

const read = () => {
	console.error("reading from stdin...");
	return fs.readFileSync("/dev/stdin").toString();
};

const readImage = path => {
	try {
		return fs.readFileSync(path, { encoding: "base64" });
	} catch (error) {
		handleFileError(error, path);
		throw error;
	}
};

(async () => {
	const inputPath = program.inputImage;
	const outputPath = program.outputImage;
	if (!inputPath || !outputPath) die();

	const text = program.text || read();
	if (!text) die();

	const image = readImage(inputPath);

	const rendered = await renderTemplate(TEMPLATE, {
		text: he.encode(smartquotes(text)),
		image,
		fonts
	});
	await screenshot(rendered, outputPath);
})();
