-- Create team_groups table
CREATE TABLE team_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create team_group_members table
CREATE TABLE team_group_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES team_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'member',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- Create team_discussions table
CREATE TABLE team_discussions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  group_id UUID REFERENCES team_groups(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create discussion_comments table
CREATE TABLE discussion_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  discussion_id UUID NOT NULL REFERENCES team_discussions(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES discussion_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create team_tasks table
CREATE TABLE team_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  group_id UUID REFERENCES team_groups(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  priority VARCHAR(50) DEFAULT 'medium',
  due_date TIMESTAMPTZ,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create task_comments table
CREATE TABLE task_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES team_tasks(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create team_documents table
CREATE TABLE team_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  group_id UUID REFERENCES team_groups(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  is_template BOOLEAN DEFAULT false,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create document_versions table
CREATE TABLE document_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES team_documents(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  version_number INTEGER NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(document_id, version_number)
);

-- Enable RLS
ALTER TABLE team_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussion_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;

-- Team Groups Policies
CREATE POLICY "select_team_groups_policy"
  ON team_groups FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM members
    WHERE members.workspace_id = team_groups.workspace_id
    AND members.user_id = auth.uid()
  ));

CREATE POLICY "all_team_groups_policy"
  ON team_groups FOR ALL
  USING (EXISTS (
    SELECT 1 FROM members
    WHERE members.workspace_id = team_groups.workspace_id
    AND members.user_id = auth.uid()
    AND members.role IN ('owner', 'admin')
  ));

-- Group Members Policies
CREATE POLICY "select_team_group_members_policy"
  ON team_group_members FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM team_groups
    JOIN members ON members.workspace_id = team_groups.workspace_id
    WHERE team_groups.id = team_group_members.group_id
    AND members.user_id = auth.uid()
  ));

CREATE POLICY "all_team_group_members_policy"
  ON team_group_members FOR ALL
  USING (EXISTS (
    SELECT 1 FROM team_groups
    JOIN members ON members.workspace_id = team_groups.workspace_id
    WHERE team_groups.id = team_group_members.group_id
    AND members.user_id = auth.uid()
    AND members.role IN ('owner', 'admin')
  ));

-- Discussions Policies
CREATE POLICY "select_team_discussions_policy"
  ON team_discussions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM members
    WHERE members.workspace_id = team_discussions.workspace_id
    AND members.user_id = auth.uid()
  ));

CREATE POLICY "insert_team_discussions_policy"
  ON team_discussions FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM members
    WHERE members.workspace_id = team_discussions.workspace_id
    AND members.user_id = auth.uid()
  ));

CREATE POLICY "update_team_discussions_policy"
  ON team_discussions FOR UPDATE
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM members
      WHERE members.workspace_id = team_discussions.workspace_id
      AND members.user_id = auth.uid()
      AND members.role IN ('owner', 'admin')
    )
  );

-- Comments Policies
CREATE POLICY "select_discussion_comments_policy"
  ON discussion_comments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM team_discussions
    JOIN members ON members.workspace_id = team_discussions.workspace_id
    WHERE team_discussions.id = discussion_comments.discussion_id
    AND members.user_id = auth.uid()
  ));

CREATE POLICY "insert_discussion_comments_policy"
  ON discussion_comments FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM team_discussions
    JOIN members ON members.workspace_id = team_discussions.workspace_id
    WHERE team_discussions.id = discussion_comments.discussion_id
    AND members.user_id = auth.uid()
  ));

-- Tasks Policies
CREATE POLICY "select_team_tasks_policy"
  ON team_tasks FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM members
    WHERE members.workspace_id = team_tasks.workspace_id
    AND members.user_id = auth.uid()
  ));

CREATE POLICY "insert_team_tasks_policy"
  ON team_tasks FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM members
    WHERE members.workspace_id = team_tasks.workspace_id
    AND members.user_id = auth.uid()
  ));

CREATE POLICY "update_team_tasks_policy"
  ON team_tasks FOR UPDATE
  USING (
    created_by = auth.uid() OR
    assigned_to = auth.uid() OR
    EXISTS (
      SELECT 1 FROM members
      WHERE members.workspace_id = team_tasks.workspace_id
      AND members.user_id = auth.uid()
      AND members.role IN ('owner', 'admin')
    )
  );

-- Task Comments Policies
CREATE POLICY "select_task_comments_policy"
  ON task_comments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM team_tasks
    JOIN members ON members.workspace_id = team_tasks.workspace_id
    WHERE team_tasks.id = task_comments.task_id
    AND members.user_id = auth.uid()
  ));

CREATE POLICY "insert_task_comments_policy"
  ON task_comments FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM team_tasks
    JOIN members ON members.workspace_id = team_tasks.workspace_id
    WHERE team_tasks.id = task_comments.task_id
    AND members.user_id = auth.uid()
  ));

-- Documents Policies
CREATE POLICY "select_team_documents_policy"
  ON team_documents FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM members
    WHERE members.workspace_id = team_documents.workspace_id
    AND members.user_id = auth.uid()
  ));

CREATE POLICY "insert_team_documents_policy"
  ON team_documents FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM members
    WHERE members.workspace_id = team_documents.workspace_id
    AND members.user_id = auth.uid()
  ));

CREATE POLICY "update_team_documents_policy"
  ON team_documents FOR UPDATE
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM members
      WHERE members.workspace_id = team_documents.workspace_id
      AND members.user_id = auth.uid()
      AND members.role IN ('owner', 'admin')
    )
  );

-- Document Versions Policies
CREATE POLICY "select_document_versions_policy"
  ON document_versions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM team_documents
    JOIN members ON members.workspace_id = team_documents.workspace_id
    WHERE team_documents.id = document_versions.document_id
    AND members.user_id = auth.uid()
  ));

CREATE POLICY "insert_document_versions_policy"
  ON document_versions FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM team_documents
    JOIN members ON members.workspace_id = team_documents.workspace_id
    WHERE team_documents.id = document_versions.document_id
    AND (
      team_documents.created_by = auth.uid() OR
      members.role IN ('owner', 'admin')
    )
  ));
