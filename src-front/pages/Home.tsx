import { useEffect, useState } from "react";
import Btn from "../components/Btn/Btn";
import "./Home.scss";
import { safeFetch } from "../lib/utils";
import {
  KEEPIX_API_URL,
  PLUGIN_API_SUBPATH,
  COSMOS_NODE_API_URL,
} from "../constants";
import { useQuery, useMutation } from "@tanstack/react-query";

import {
  getPluginStatus,
  getPluginSyncProgress,
  getPluginWallet,
} from "../queries/api";
import Sprites from "../components/Sprites/Sprites";
import BigLoader from "../components/BigLoader/BigLoader";
import BannerAlert from "../components/BannerAlert/BannerAlert";
import BigLogo from "../components/BigLogo/BigLogo";
import Progress from "../components/Progress/Progress";
import axios from "axios";
import BakersDropdown from "../components/Baker/BakersDropdown";
import BakerDetails from "../components/Baker/BakerDetails";
import RewardsSection from "../components/Baker/RewardsSection";
import FAQ from "../components/Faq/Faq";

interface BakerOptionType {
  label: string;
  value: string;
  customAbbreviation: string; // URL to the baker's image
}
export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const [selectedBaker, setSelectedBaker] = useState<BakerOptionType | null>(
    null
  );

  const walletQuery = useQuery({
    queryKey: ["getPluginWallet"],
    queryFn: getPluginWallet,
    refetchInterval: 2000,
  });

  const getDataBaker = useMutation({
    mutationFn: async (address: string) => {
      const reponse = await axios.get(
        `${COSMOS_NODE_API_URL}/baker/${address}`
      );
      return reponse.data;
    },
    onError: (error: any) => {},
  });

  const getBakersQuery = useMutation({
    mutationFn: async () => {
      const reponse = await axios.get(`${COSMOS_NODE_API_URL}/bakers`);
      return reponse.data;
    },
    onError: (error: any) => {},
  });

  const getWalletBalance = useMutation({
    mutationFn: async () => {
      const reponse = await axios.get(
        `${KEEPIX_API_URL}${PLUGIN_API_SUBPATH}/wallet-balance`
      );
      return reponse.data;
    },
    onError: (error: any) => {},
  });

  const postStartSync = useMutation({
    mutationFn: async () => {
      const reponse = await axios.get(
        `${KEEPIX_API_URL}${PLUGIN_API_SUBPATH}/start-sync`
      );
      return reponse.data;
    },
    onError: (error: any) => {},
  });

  const postStartConfig = useMutation({
    mutationFn: async () => {
      const reponse = await axios.get(
        `${KEEPIX_API_URL}${PLUGIN_API_SUBPATH}/start-config`
      );
      return reponse.data;
    },
    onError: (error: any) => {},
  });

  const postRestartNode = useMutation({
    mutationFn: async () => {
      const reponse = await axios.get(
        `${KEEPIX_API_URL}${PLUGIN_API_SUBPATH}/setup-node`
      );
      return reponse.data;
    },
    onError: (error: any) => {},
  });

  const postInitState = useMutation({
    mutationFn: async () => {
      const reponse = await axios.get(
        `${KEEPIX_API_URL}${PLUGIN_API_SUBPATH}/init-state`
      );
      return reponse.data;
    },
    onError: (error: any) => {},
  });

  const statusQuery = useQuery({
    queryKey: ["getPluginStatus"],
    queryFn: async () => {
      if (walletQuery.data === undefined) {
        await walletQuery.refetch();
      }
      return getPluginStatus();
    },
    refetchInterval: 2000,
  });

  const syncProgressQuery = useQuery({
    queryKey: ["getPluginSyncProgress"],
    queryFn: getPluginSyncProgress,
    refetchInterval: 5000,
    enabled: statusQuery.data?.NodeState === "NODE_RUNNING",
  });

  const handleBakerSelect = (baker: any) => {
    getDataBaker.mutate(baker.value);
    getWalletBalance.mutate();
  };

  return (
    <div className="AppBase-content">
      {(!statusQuery?.data || loading) && (
        <BigLoader title="" full={true}></BigLoader>
      )}

      {statusQuery?.data && statusQuery.data?.NodeState === "NO_STATE" && (
        <BannerAlert status="danger">
          Error with the Plugin "{statusQuery.data?.NodeState}" please
          Reinstall.
        </BannerAlert>
      )}
      {statusQuery?.data && statusQuery.data?.Alive === false && (
        <BigLogo full={true}>
          <Btn
            status="warning"
            onClick={async () => {
              setLoading(true);
              await safeFetch(`${KEEPIX_API_URL}${PLUGIN_API_SUBPATH}/start`);
              setLoading(false);
            }}
          >
            Start
          </Btn>
        </BigLogo>
      )}

      {statusQuery?.data &&
        statusQuery.data?.NodeState === "NODE_RUNNING" &&
        walletQuery.data?.Wallet === undefined && <>setup wallet</>}
      {statusQuery?.data &&
        !syncProgressQuery?.data &&
        statusQuery.data?.NodeState === "STARTING_INSTALLATION" &&
        statusQuery.data?.Alive === true && (
          <BigLoader
            title="Estimation: 1 to 5 minutes."
            label="Starting installation of the node"
            step="1/3"
            disableStep={false}
            full={true}
          ></BigLoader>
        )}
      {statusQuery?.data &&
        !syncProgressQuery?.data &&
        statusQuery.data?.NodeState === "NODE_RUNNING" &&
        !statusQuery.data?.IsSynchronizing &&
        statusQuery.data?.Alive === true && (
          <BigLoader
            title="Estimation: 10 to 20 minutes."
            label="Downloading snapshot file"
            step="2/3"
            disableStep={false}
            full={true}
          ></BigLoader>
        )}

      {statusQuery?.data &&
        !syncProgressQuery?.data &&
        statusQuery.data?.NodeState === "NODE_RUNNING" &&
        statusQuery.data?.IsSynchronizing &&
        statusQuery.data?.Alive === true && (
          <BigLoader
            step="3/3"
            disableStep={false}
            full={true}
            title={`${
              Number(statusQuery.data?.ServerLatestBlockHeight) -
              Number(statusQuery.data?.LocallatestBlockHeight)
            } blocks to validate to complete synchronization`}
            label="Synchronizing and validating data from a snapshot file"
          ></BigLoader>
        )}

      {statusQuery?.data &&
        !syncProgressQuery?.data &&
        statusQuery.data?.NodeState === "STARTING_SYNC" &&
        statusQuery.data?.SnapshotImportExitCode === "'0'" &&
        !statusQuery.data?.IsSnapshotImportRunning &&
        statusQuery.data?.Alive === true && (
          <BigLoader
            full={true}
            label="Finalize the configuration and launch the node"
            isLoading={false}
            step="3/3"
            disableStep={false}
          >
            <Btn
              disabled={postStartConfig.isPending ? true : false}
              status={postStartConfig.isPending ? "gray" : "success"}
              onClick={async () => {
                postStartConfig.mutate();
                postInitState.mutate();
              }}
            >
              START NODE
            </Btn>
          </BigLoader>
        )}
      {statusQuery?.data &&
        !syncProgressQuery?.data &&
        statusQuery.data?.NodeState === "NODE_RUNNING" &&
        walletQuery.data?.Wallet !== undefined && (
          <BigLoader
            title="Estimation: 1 to 10 minutes."
            label="Retrieving synchronization information"
            full={true}
          >
            <Btn
              status="danger"
              onClick={async () => {
                await safeFetch(`${KEEPIX_API_URL}${PLUGIN_API_SUBPATH}/stop`);
              }}
            >
              Stop
            </Btn>
          </BigLoader>
        )}

      {statusQuery?.data &&
        syncProgressQuery?.data &&
        syncProgressQuery?.data?.IsSynced === false &&
        statusQuery.data?.NodeState === "NODE_RUNNING" &&
        walletQuery.data?.Wallet !== undefined && (
          <BigLoader
            title={
              syncProgressQuery?.data?.ExecutionTimeEstimated
                ? `Estimation: ${
                    Math.floor(
                      syncProgressQuery?.data?.ExecutionTimeEstimated / 60
                    ) > 0
                      ? Math.floor(
                          syncProgressQuery?.data?.ExecutionTimeEstimated / 60
                        ) + "h"
                      : ""
                  } ${
                    Math.round(
                      syncProgressQuery?.data?.ExecutionTimeEstimated % 60
                    ) > 0
                      ? Math.round(
                          syncProgressQuery?.data?.ExecutionTimeEstimated % 60
                        )
                      : 1
                  } min`
                : "Estimation: 1 hour to several days."
            }
            disableLabel={true}
            full={true}
          >
            <div className="state-title">
              <strong>{`Execution Sync Progress:`}</strong>
              <Progress
                percent={Number(syncProgressQuery?.data.ExecutionSyncProgress)}
                description={
                  syncProgressQuery?.data
                    .ExecutionSyncProgressStepDescription ?? ""
                }
              ></Progress>
            </div>
          </BigLoader>
        )}

      <Sprites></Sprites>
    </div>
  );
}
