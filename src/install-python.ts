import { extract } from 'tar';
import fetch from 'node-fetch';
import createDebug from 'debug';
import { createGunzip } from 'zlib';

const debug = createDebug('@zeit/fun:install-python');

export function generatePythonTarballUrl(
	version: string,
	platform: string = process.platform,
	arch: string = process.arch
): string {
	return `https://python-binaries.zeit.sh/python-${version}-${platform}-${arch}.tar.gz`;
}

export async function installPython(
	dest: string,
	version: string,
	platform: string = process.platform,
	arch: string = process.arch
): Promise<void> {
	const tarballUrl = generatePythonTarballUrl(version, platform, arch);
	debug('Downloading Python %s tarball %o', version, tarballUrl);
	const res = await fetch(tarballUrl);
	if (!res.ok) {
		throw new Error(`HTTP request failed: ${res.status}`);
	}
	return new Promise((resolve, reject) => {
		debug('Extracting Python %s tarball to %o', version, dest);
		res.body
			.pipe(createGunzip())
			.pipe(extract({ strip: 1, C: dest }))
			.on('error', reject)
			.on('end', resolve);
	});
}
