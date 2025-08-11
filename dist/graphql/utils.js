// AUTO-GENERATED - DO NOT EDIT
import fetch from 'node-fetch';
import { loadConfig } from '../framework/config.js';
export async function call(query, variables) {
    const cfg = loadConfig();
    const headers = {
        'content-type': 'application/json',
        ...(cfg.headers || {}),
    };
    if (cfg.auth.type === 'basic')
        headers['authorization'] =
            'Basic ' +
                Buffer.from(cfg.auth.username + ':' + cfg.auth.password).toString('base64');
    if (cfg.auth.type === 'bearer')
        headers['authorization'] = 'Bearer ' + cfg.auth.token;
    const res = await fetch(cfg.endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({ query, variables }),
    });
    return res.json();
}
//# sourceMappingURL=utils.js.map