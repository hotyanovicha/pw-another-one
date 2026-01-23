import path from 'path';

const TEST_FILES_DIR = path.join(__dirname, '../ui/test-data/files');

export const TestFiles = {
	PDF: {
		SAMPLE: path.join(TEST_FILES_DIR, 'pdf/sample.pdf'),
	},
	DOC: {
		SAMPLE_DOC: path.join(TEST_FILES_DIR, 'doc/sample.docx'),
	},
} as const;
