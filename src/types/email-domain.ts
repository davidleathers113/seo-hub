export interface EmailDomain {
  id: string;
  workspaceId: string;
  domainName: string;
  mxRecord: string | null;
  spfRecord: string | null;
  dkimSelector: string | null;
  dkimPrivateKey: string | null;
  dkimPublicKey: string | null;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface EmailDomainVerification {
  id: string;
  emailDomainId: string;
  verificationType: 'MX' | 'SPF' | 'DKIM';
  verificationValue: string;
  verified: boolean;
  verifiedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DKIMKeyPair {
  privateKey: string;
  publicKey: string;
}

export interface EmailDomainWithVerifications extends EmailDomain {
  verifications: EmailDomainVerification[];
}

export interface EmailDomainSetupStatus {
  mxVerified: boolean;
  spfVerified: boolean;
  dkimVerified: boolean;
  allVerified: boolean;
}