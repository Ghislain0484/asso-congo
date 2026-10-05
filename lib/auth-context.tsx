'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase-client';
import type { Profile, Organization, OrganizationMember } from '@/lib/types';
import { MOCK_ORGANIZATION } from '@/lib/mock-data';

export type DemoPersona = 'adherent' | 'association' | 'regulator';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  organizations: (OrganizationMember & { organization: Organization })[];
  currentOrg: Organization | null;
  setCurrentOrg: (org: Organization | null) => void;
  demoPersona: DemoPersona;
  setDemoPersona: (persona: DemoPersona) => void;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  session: null,
  profile: null,
  organizations: [],
  currentOrg: MOCK_ORGANIZATION,
  setCurrentOrg: () => {},
  demoPersona: 'association',
  setDemoPersona: () => {},
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [organizations, setOrganizations] = useState<(OrganizationMember & { organization: Organization })[]>([]);
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('assocongo_custom_org');
        if (stored) return JSON.parse(stored);
      } catch {}
    }
    return MOCK_ORGANIZATION;
  });
  const [demoPersona, setDemoPersona] = useState<DemoPersona>('association');
  const [loading, setLoading] = useState(true);

  const loadUserData = async (userId: string) => {
    try {
      // 1. Priorité à l'organisation personnalisée récemment créée si présente
      let customOrg: Organization | null = null;
      if (typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem('assocongo_custom_org');
          if (stored) customOrg = JSON.parse(stored);
        } catch {}
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      setProfile(profileData as Profile | null);

      if (customOrg) {
        setCurrentOrg(customOrg);
        setOrganizations([
          {
            id: `membership-${customOrg.id}`,
            organization_id: customOrg.id,
            user_id: userId,
            role: 'admin',
            invited_by: null,
            accepted_at: new Date().toISOString(),
            deleted_at: null,
            created_at: new Date().toISOString(),
            organization: customOrg,
          },
        ]);
        return;
      }

      const { data: orgMembers } = await supabase
        .from('organization_members')
        .select('*, organization:organizations(*)')
        .eq('user_id', userId)
        .is('deleted_at', null)
        .order('created_at', { ascending: true });

      if (orgMembers && orgMembers.length > 0) {
        setOrganizations(orgMembers as (OrganizationMember & { organization: Organization })[]);
        if (!currentOrg) {
          setCurrentOrg(orgMembers[0].organization as Organization);
        }
      } else {
        // Fallback automatique : pour les super_admin (DGIFN / Dev) ou comptes démo,
        // charger la première organisation active pour permettre l'audit et la démonstration
        const { data: defaultOrgs } = await supabase
          .from('organizations')
          .select('*')
          .eq('status', 'active')
          .is('deleted_at', null)
          .order('created_at', { ascending: false })
          .limit(1);

        if (defaultOrgs && defaultOrgs.length > 0) {
          const fallbackOrg = defaultOrgs[0] as Organization;
          setCurrentOrg(fallbackOrg);
          setOrganizations([
            {
              id: 'demo-membership',
              organization_id: fallbackOrg.id,
              user_id: userId,
              role: profileData?.platform_role === 'super_admin' ? 'super_admin' : 'admin',
              invited_by: null,
              accepted_at: new Date().toISOString(),
              deleted_at: null,
              created_at: new Date().toISOString(),
              organization: fallbackOrg,
            },
          ]);
        } else {
          setCurrentOrg(MOCK_ORGANIZATION);
          setOrganizations([
            {
              id: 'demo-mock-membership',
              organization_id: MOCK_ORGANIZATION.id,
              user_id: userId,
              role: profileData?.platform_role === 'super_admin' ? 'super_admin' : 'admin',
              invited_by: null,
              accepted_at: new Date().toISOString(),
              deleted_at: null,
              created_at: new Date().toISOString(),
              organization: MOCK_ORGANIZATION,
            },
          ]);
        }
      }
    } catch (err) {
      console.warn('Note: session information loaded with fallback:', err);
      setCurrentOrg(MOCK_ORGANIZATION);
    }
  };

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        const email = session.user.email?.toLowerCase() || '';
        if (email.includes('adherent')) {
          setDemoPersona('adherent');
        } else if (email.includes('dgifn') || email.includes('finances')) {
          setDemoPersona('regulator');
        }
        loadUserData(session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        if (!mounted) return;
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          const email = session.user.email?.toLowerCase() || '';
          if (email.includes('adherent')) {
            setDemoPersona('adherent');
          } else if (email.includes('dgifn') || email.includes('finances')) {
            setDemoPersona('regulator');
          }
          await loadUserData(session.user.id);
        } else {
          setProfile(null);
          setOrganizations([]);
          setCurrentOrg(MOCK_ORGANIZATION);
        }
        setLoading(false);
      })();
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setOrganizations([]);
    setCurrentOrg(MOCK_ORGANIZATION);
    setDemoPersona('association');
  };

  const refreshProfile = async () => {
    if (user) {
      await loadUserData(user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        organizations,
        currentOrg,
        setCurrentOrg,
        demoPersona,
        setDemoPersona,
        loading,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
