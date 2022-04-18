import { superTokensNextWrapper } from 'supertokens-node/nextjs';
import { verifySession } from 'supertokens-node/recipe/session/framework/express';
import { SessionRequest } from 'supertokens-node/framework/express';

export default async function setRole(req: SessionRequest, res: any) {
    await superTokensNextWrapper(
        async (next) => {
            await verifySession()(req, res, next);
        },
        req,
        res
    );

    let userId = req.session!.getUserId();
    let role = 'default'; // TODO: fetch based on user

    await req.session!.updateAccessTokenPayload({ role });

    return res.json({
        userId: req.session!.getUserId(),
        role: req.session!.getAccessTokenPayload()['role'],
    });
}
