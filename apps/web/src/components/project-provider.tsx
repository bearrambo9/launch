"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";

const BACKEND_API_URL = process.env.BACKEND_API_URL || "http://localhost:3001";

type ProjectContextValue = {
  projectId: string;
  accessToken: string;
  containerReady: boolean;
};

const ProjectContext = createContext<ProjectContextValue | null>(null);

export function useProjectContext() {
  const ctx = useContext(ProjectContext);

  if (!ctx)
    throw new Error("useProjectContext must be used inside ProjectProvider");
  return ctx;
}

export function ProjectProvider({
  projectId,
  accessToken,
  children,
}: {
  projectId: string;
  accessToken: string;
  children: React.ReactNode;
}) {
  const [containerReady, setContainerReady] = useState(false);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const initializeContainer = async () => {
      try {
        const res = await fetch(
          `${BACKEND_API_URL}/projects/${projectId}/container/initialize`,
          {
            method: "POST",
            headers: {
              "content-type": "application/json",
              authorization: `Bearer ${accessToken}`,
            },
          },
        );
        const data = await res.json();
        if (data.error || !data.containerId) {
          console.log(data.error);
          alert(
            "There was an error initializing the container. Check the console.",
          );
          return;
        }
        setContainerReady(true);
      } catch (error) {
        console.log(error);
      }
    };

    initializeContainer();
  }, [projectId, accessToken]);

  return (
    <ProjectContext.Provider value={{ projectId, accessToken, containerReady }}>
      {children}
    </ProjectContext.Provider>
  );
}
