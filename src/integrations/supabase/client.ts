
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fejbagfrppsqfwhlzyxc.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlamJhZ2ZycHBzcWZ3aGx6eXhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4MDIzMTEsImV4cCI6MjA2NjM3ODMxMX0.jyOgdWSFEV76YguluyvFneXygTkjCudncs4EFUF_N5I'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
