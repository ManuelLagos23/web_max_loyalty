// ./src/types/next-auth.d.ts
declare module "next-auth" {
    interface User {
      id: string;
      nombre: string; // Requerido
      email: string;
      image?: string | null; // Opcional, coincide con NextAuth por defecto
      num_telefono?: string | null; // Opcional
    }
  
    interface Session {
      user: User;
    }
  }
  
  declare module "next-auth/jwt" {
    interface JWT {
      sub: string;
      nombre: string;
      email: string;
      image?: string | null;
      num_telefono?: string | null;
    }
  }