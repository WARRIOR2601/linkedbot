CREATE EXTENSION IF NOT EXISTS "pg_cron";
CREATE EXTENSION IF NOT EXISTS "pg_graphql";
CREATE EXTENSION IF NOT EXISTS "pg_net";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "plpgsql";
CREATE EXTENSION IF NOT EXISTS "supabase_vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
BEGIN;

--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: app_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.app_role AS ENUM (
    'admin',
    'user'
);


--
-- Name: subscription_plan; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.subscription_plan AS ENUM (
    'free',
    'pro',
    'business'
);


--
-- Name: handle_new_user_role(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user_role() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.user_id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$;


--
-- Name: handle_new_user_subscription(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user_subscription() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO public.user_subscriptions (user_id, plan, max_agents, trial_ends_at)
  VALUES (
    NEW.id, 
    'free', 
    1, 
    NOW() + INTERVAL '14 days'
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;


--
-- Name: has_role(uuid, public.app_role); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: agent_training_data; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.agent_training_data (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    agent_id uuid NOT NULL,
    user_id uuid NOT NULL,
    training_type text DEFAULT 'sample_post'::text NOT NULL,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: agents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.agents (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    name text NOT NULL,
    agent_type text DEFAULT 'professional'::text NOT NULL,
    posting_goal text,
    tone_of_voice text,
    topics text[] DEFAULT '{}'::text[],
    posting_frequency text DEFAULT 'daily'::text NOT NULL,
    preferred_posting_days integer[] DEFAULT '{1,2,3,4,5}'::integer[],
    preferred_time_window_start time without time zone DEFAULT '09:00:00'::time without time zone,
    preferred_time_window_end time without time zone DEFAULT '17:00:00'::time without time zone,
    status text DEFAULT 'paused'::text NOT NULL,
    last_post_at timestamp with time zone,
    posts_created integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    about_user text,
    about_company text,
    target_audience text,
    sample_posts text[],
    auto_generate_images boolean DEFAULT true,
    allow_text_only_posts boolean DEFAULT true,
    preferred_image_style text
);


--
-- Name: ai_training_updates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_training_updates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    content text NOT NULL,
    update_type text DEFAULT 'general'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT ai_training_updates_update_type_check CHECK ((update_type = ANY (ARRAY['general'::text, 'tone'::text, 'focus'::text, 'business'::text])))
);


--
-- Name: client_ai_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.client_ai_profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    business_name text,
    industry text,
    description text,
    target_audience text,
    goals text[],
    tone_of_voice text,
    posting_frequency text,
    is_complete boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    account_status text DEFAULT 'active'::text NOT NULL,
    CONSTRAINT client_ai_profiles_account_status_check CHECK ((account_status = ANY (ARRAY['active'::text, 'suspended'::text])))
);


--
-- Name: linkedin_accounts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.linkedin_accounts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    linkedin_user_id text,
    profile_name text,
    profile_photo_url text,
    headline text,
    followers_count integer,
    access_token_encrypted text,
    refresh_token_encrypted text,
    token_expires_at timestamp with time zone,
    is_connected boolean DEFAULT false NOT NULL,
    connected_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: post_analytics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.post_analytics (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    post_id uuid NOT NULL,
    user_id uuid NOT NULL,
    impressions integer DEFAULT 0 NOT NULL,
    likes integer DEFAULT 0 NOT NULL,
    comments integer DEFAULT 0 NOT NULL,
    shares integer DEFAULT 0 NOT NULL,
    engagement_rate numeric(5,2) DEFAULT 0 NOT NULL,
    recorded_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: posts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.posts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    content text NOT NULL,
    ai_model text NOT NULL,
    tags text[] DEFAULT '{}'::text[],
    hashtags text[] DEFAULT '{}'::text[],
    post_length text DEFAULT 'medium'::text NOT NULL,
    guidance text,
    status text DEFAULT 'draft'::text NOT NULL,
    scheduled_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    posted_at timestamp with time zone,
    linkedin_post_id text,
    error_message text,
    retry_count integer DEFAULT 0 NOT NULL,
    image_url text,
    agent_id uuid,
    CONSTRAINT posts_post_length_check CHECK ((post_length = ANY (ARRAY['short'::text, 'medium'::text, 'long'::text]))),
    CONSTRAINT posts_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'scheduled'::text])))
);


--
-- Name: upcoming_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.upcoming_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    title text NOT NULL,
    description text,
    event_date date NOT NULL,
    event_type text DEFAULT 'general'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role public.app_role DEFAULT 'user'::public.app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: user_subscriptions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_subscriptions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    plan public.subscription_plan DEFAULT 'free'::public.subscription_plan NOT NULL,
    max_agents integer DEFAULT 1 NOT NULL,
    autonomous_posting_enabled boolean DEFAULT false NOT NULL,
    image_generation_enabled boolean DEFAULT false NOT NULL,
    advanced_analytics_enabled boolean DEFAULT false NOT NULL,
    priority_execution boolean DEFAULT false NOT NULL,
    show_branding boolean DEFAULT true NOT NULL,
    trial_ends_at timestamp with time zone,
    stripe_customer_id text,
    stripe_subscription_id text,
    current_period_start timestamp with time zone,
    current_period_end timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: agent_training_data agent_training_data_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agent_training_data
    ADD CONSTRAINT agent_training_data_pkey PRIMARY KEY (id);


--
-- Name: agents agents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agents
    ADD CONSTRAINT agents_pkey PRIMARY KEY (id);


--
-- Name: ai_training_updates ai_training_updates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_training_updates
    ADD CONSTRAINT ai_training_updates_pkey PRIMARY KEY (id);


--
-- Name: client_ai_profiles client_ai_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_ai_profiles
    ADD CONSTRAINT client_ai_profiles_pkey PRIMARY KEY (id);


--
-- Name: client_ai_profiles client_ai_profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_ai_profiles
    ADD CONSTRAINT client_ai_profiles_user_id_key UNIQUE (user_id);


--
-- Name: linkedin_accounts linkedin_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.linkedin_accounts
    ADD CONSTRAINT linkedin_accounts_pkey PRIMARY KEY (id);


--
-- Name: linkedin_accounts linkedin_accounts_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.linkedin_accounts
    ADD CONSTRAINT linkedin_accounts_user_id_key UNIQUE (user_id);


--
-- Name: post_analytics post_analytics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.post_analytics
    ADD CONSTRAINT post_analytics_pkey PRIMARY KEY (id);


--
-- Name: posts posts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_pkey PRIMARY KEY (id);


--
-- Name: upcoming_events upcoming_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.upcoming_events
    ADD CONSTRAINT upcoming_events_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);


--
-- Name: user_subscriptions user_subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_subscriptions
    ADD CONSTRAINT user_subscriptions_pkey PRIMARY KEY (id);


--
-- Name: user_subscriptions user_subscriptions_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_subscriptions
    ADD CONSTRAINT user_subscriptions_user_id_key UNIQUE (user_id);


--
-- Name: client_ai_profiles on_profile_created_add_role; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER on_profile_created_add_role AFTER INSERT ON public.client_ai_profiles FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();


--
-- Name: agents update_agents_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON public.agents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: client_ai_profiles update_client_ai_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_client_ai_profiles_updated_at BEFORE UPDATE ON public.client_ai_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: linkedin_accounts update_linkedin_accounts_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_linkedin_accounts_updated_at BEFORE UPDATE ON public.linkedin_accounts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: post_analytics update_post_analytics_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_post_analytics_updated_at BEFORE UPDATE ON public.post_analytics FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: posts update_posts_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON public.posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: upcoming_events update_upcoming_events_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_upcoming_events_updated_at BEFORE UPDATE ON public.upcoming_events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: user_subscriptions update_user_subscriptions_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_user_subscriptions_updated_at BEFORE UPDATE ON public.user_subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: agent_training_data agent_training_data_agent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agent_training_data
    ADD CONSTRAINT agent_training_data_agent_id_fkey FOREIGN KEY (agent_id) REFERENCES public.agents(id) ON DELETE CASCADE;


--
-- Name: ai_training_updates ai_training_updates_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_training_updates
    ADD CONSTRAINT ai_training_updates_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: client_ai_profiles client_ai_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_ai_profiles
    ADD CONSTRAINT client_ai_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: post_analytics post_analytics_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.post_analytics
    ADD CONSTRAINT post_analytics_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;


--
-- Name: posts posts_agent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_agent_id_fkey FOREIGN KEY (agent_id) REFERENCES public.agents(id) ON DELETE SET NULL;


--
-- Name: posts posts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_subscriptions Service role can manage subscriptions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can manage subscriptions" ON public.user_subscriptions USING ((auth.role() = 'service_role'::text));


--
-- Name: agent_training_data Users can create their own agent training data; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own agent training data" ON public.agent_training_data FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: agents Users can create their own agents; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own agents" ON public.agents FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: upcoming_events Users can create their own events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own events" ON public.upcoming_events FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: posts Users can create their own posts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own posts" ON public.posts FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: ai_training_updates Users can create their own training updates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own training updates" ON public.ai_training_updates FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: linkedin_accounts Users can delete their own LinkedIn account; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own LinkedIn account" ON public.linkedin_accounts FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: agent_training_data Users can delete their own agent training data; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own agent training data" ON public.agent_training_data FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: agents Users can delete their own agents; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own agents" ON public.agents FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: upcoming_events Users can delete their own events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own events" ON public.upcoming_events FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: posts Users can delete their own posts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own posts" ON public.posts FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: ai_training_updates Users can delete their own training updates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own training updates" ON public.ai_training_updates FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: linkedin_accounts Users can insert their own LinkedIn account; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own LinkedIn account" ON public.linkedin_accounts FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: post_analytics Users can insert their own analytics; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own analytics" ON public.post_analytics FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: client_ai_profiles Users can insert their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own profile" ON public.client_ai_profiles FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: linkedin_accounts Users can update their own LinkedIn account; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own LinkedIn account" ON public.linkedin_accounts FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: agents Users can update their own agents; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own agents" ON public.agents FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: post_analytics Users can update their own analytics; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own analytics" ON public.post_analytics FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: upcoming_events Users can update their own events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own events" ON public.upcoming_events FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: posts Users can update their own posts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own posts" ON public.posts FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: client_ai_profiles Users can update their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own profile" ON public.client_ai_profiles FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: user_subscriptions Users can update their own subscription; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own subscription" ON public.user_subscriptions FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: linkedin_accounts Users can view their own LinkedIn account; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own LinkedIn account" ON public.linkedin_accounts FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: agent_training_data Users can view their own agent training data; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own agent training data" ON public.agent_training_data FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: agents Users can view their own agents; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own agents" ON public.agents FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: post_analytics Users can view their own analytics; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own analytics" ON public.post_analytics FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: upcoming_events Users can view their own events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own events" ON public.upcoming_events FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: posts Users can view their own posts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own posts" ON public.posts FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: client_ai_profiles Users can view their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own profile" ON public.client_ai_profiles FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: user_roles Users can view their own roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: user_subscriptions Users can view their own subscription; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own subscription" ON public.user_subscriptions FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: ai_training_updates Users can view their own training updates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own training updates" ON public.ai_training_updates FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: agent_training_data; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.agent_training_data ENABLE ROW LEVEL SECURITY;

--
-- Name: agents; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;

--
-- Name: ai_training_updates; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ai_training_updates ENABLE ROW LEVEL SECURITY;

--
-- Name: client_ai_profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.client_ai_profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: linkedin_accounts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.linkedin_accounts ENABLE ROW LEVEL SECURITY;

--
-- Name: post_analytics; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.post_analytics ENABLE ROW LEVEL SECURITY;

--
-- Name: posts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

--
-- Name: upcoming_events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.upcoming_events ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- Name: user_subscriptions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--




COMMIT;