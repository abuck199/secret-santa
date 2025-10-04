import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.REACT_APP_SUPABASE_SERVICE_KEY;

// Client pour les opérations non authentifiées (login uniquement)
export const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);

// Client pour les opérations authentifiées (après login)
export const supabase = createClient(supabaseUrl, supabaseServiceKey);