interface User {
  _id: string;
  email: string;
  [key: string]: any;
}

declare const UserService: {
  get: (id: string) => Promise<User | null>;
  getByEmail: (email: string) => Promise<User | null>;
  create: (userData: Partial<User>) => Promise<User>;
  update: (id: string, userData: Partial<User>) => Promise<User | null>;
  delete: (id: string) => Promise<boolean>;
};

export default UserService;