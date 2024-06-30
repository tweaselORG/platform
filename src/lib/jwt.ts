import * as jose from 'jose';
import { nanoid } from 'nanoid';

// Since the download links are very short-lived anyway, we don't need a persistent secret, either.
const attachmentSecret = new TextEncoder().encode(nanoid(64));

export type AttachmentIdentifier = { proceedingToken: string; attachmentType: string };
const attachmentAudience = 'tweasel:att-dl';
const attachmentSubject = (options: AttachmentIdentifier) => `${options.proceedingToken}/${options.attachmentType}`;

const alg = 'HS256';

export const makeAttachmentJwt = (options: AttachmentIdentifier) =>
    new jose.SignJWT({})
        .setProtectedHeader({ alg })
        .setAudience(attachmentAudience)
        .setSubject(attachmentSubject(options))
        .setIssuedAt()
        .setExpirationTime('6h')
        .sign(attachmentSecret);

export const canDownloadAttachment = async (options: { jwt: string } & AttachmentIdentifier) =>
    jose
        .jwtVerify(options.jwt, attachmentSecret, {
            algorithms: [alg],
            audience: attachmentAudience,
            subject: attachmentSubject(options),
        })
        .then(() => true)
        .catch(() => false);
