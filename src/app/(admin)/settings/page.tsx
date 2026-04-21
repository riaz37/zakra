"use client";

import { useState } from "react";
import { Palette, User as UserIcon } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileSection } from "./_components/profile-section";
import { AppearanceSection } from "./_components/appearance-section";

export default function SettingsPage() {
  const [tab, setTab] = useState("profile");

  return (
    <div className="mx-auto max-w-[960px]">
      <PageHeader
        title="Settings"
        subtitle="Manage your profile and appearance"
      />

      <Tabs value={tab} onValueChange={(v: string) => setTab(v)}>
        <div className="mb-6 border-b border-[var(--border)]">
          <TabsList
            variant="line"
            className="h-11 w-full justify-start gap-4 rounded-none bg-transparent p-0"
          >
            <TabsTrigger
              value="profile"
              className="h-11 rounded-none border-0 px-0 text-[13px] font-medium data-active:text-[var(--primary)] after:bg-[var(--primary)]"
            >
              <UserIcon className="size-3.5" strokeWidth={1.75} />
              Profile
            </TabsTrigger>
            <TabsTrigger
              value="appearance"
              className="h-11 rounded-none border-0 px-0 text-[13px] font-medium data-active:text-[var(--primary)] after:bg-[var(--primary)]"
            >
              <Palette className="size-3.5" strokeWidth={1.75} />
              Appearance
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="profile" className="m-0">
          <ProfileSection />
        </TabsContent>
        <TabsContent value="appearance" className="m-0">
          <AppearanceSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}
