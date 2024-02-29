import { useEffect, useState } from "react";
import Btn from "../components/Btn/Btn";
import "./Home.scss";
import { safeFetch } from "../lib/utils";
import {
  KEEPIX_API_URL,
  PLUGIN_API_SUBPATH,
  TEZOS_NODE_API_URL,
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
      const reponse = await axios.get(`${TEZOS_NODE_API_URL}/baker/${address}`);
      return reponse.data;
    },
    onError: (error: any) => {},
  });

  const getBakersQuery = useMutation({
    mutationFn: async () => {
      const reponse = await axios.get(`${TEZOS_NODE_API_URL}/bakers`);
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

  const isDelegated =
    statusQuery?.data?.IsDelegated !== undefined &&
    statusQuery?.data?.IsDelegated
      ? true
      : false;

  useEffect(() => {
    getDataBaker.reset();
    if (isDelegated) {
      getDataBaker.mutate(statusQuery?.data?.DelegatedAddress);
      getWalletBalance.mutate();
    }
  }, [isDelegated]);

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
      {statusQuery?.data && statusQuery.data?.NodeState === "NODE_STOPPED" && (
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
        statusQuery.data?.NodeState === "INSTALLING_SNAPSHOT" && (
          <BigLoader
            title="Estimation: 5 to 10 minutes."
            label="Downloading snapshot file"
            step="1/3"
            disableStep={false}
            full={true}
          ></BigLoader>
        )}

      {statusQuery?.data &&
        !syncProgressQuery?.data &&
        statusQuery.data?.NodeState === "INSTALLING_NODE" &&
        !statusQuery.data?.IsSnapshotImportRunning && (
          <BigLoader
            full={true}
            step="2/3"
            label="Start the synchronization and validation of the node with the downloaded snapshot"
            isLoading={false}
            disableStep={false}
          >
            <Btn
              disabled={postStartSync.isPending ? true : false}
              status={postStartSync.isPending ? "gray" : "success"}
              onClick={async () => {
                postStartSync.mutate();
              }}
            >
              START SYNCHRONIZATION
            </Btn>
          </BigLoader>
        )}
      {statusQuery?.data &&
        !syncProgressQuery?.data &&
        statusQuery.data?.NodeState === "STARTING_SYNC" &&
        statusQuery.data?.IsSnapshotImportRunning && (
          <BigLoader
            step="2/3"
            disableStep={false}
            full={true}
            title="Estimation: 15 to 20 minutes."
            label="Synchronizing and validating data from a snapshot file"
          ></BigLoader>
        )}

      {statusQuery?.data &&
        !syncProgressQuery?.data &&
        statusQuery.data?.NodeState === "STARTING_SYNC" &&
        statusQuery.data?.SnapshotImportExitCode !== "'0'" &&
        !statusQuery.data?.IsSnapshotImportRunning && (
          <BigLoader
            full={true}
            label="There was a minor issue, the node needs to be restarted. Please click on the 'Restart Node' button"
            isLoading={false}
            step="1/3"
            disableStep={false}
          >
            <Btn
              disabled={postRestartNode.isPending ? true : false}
              status={postRestartNode.isPending ? "gray" : "success"}
              onClick={async () => {
                postRestartNode.mutate();
              }}
            >
              RESTART NODE
            </Btn>
          </BigLoader>
        )}

      {statusQuery?.data &&
        !syncProgressQuery?.data &&
        statusQuery.data?.NodeState === "STARTING_SYNC" &&
        statusQuery.data?.SnapshotImportExitCode === "'0'" &&
        !statusQuery.data?.IsSnapshotImportRunning && (
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

      {statusQuery?.data &&
        syncProgressQuery?.data &&
        syncProgressQuery?.data?.IsSynced === true &&
        statusQuery.data?.NodeState === "NODE_RUNNING" &&
        walletQuery.data?.Wallet !== undefined && (
          <>
            <BigLoader title="Node Ready" disableLabel={true} full={true}>
              {!isDelegated ? (
                <Btn status="warning" onClick={() => getBakersQuery.mutate()}>
                  Delegating to a bakery
                </Btn>
              ) : (
                <></>
              )}

              {getBakersQuery.isPending && <p>Loading bakers...</p>}
              {getBakersQuery.isError && <p>Error loading bakers</p>}
              {!getBakersQuery.isPending &&
                getBakersQuery.data &&
                !isDelegated && (
                  <BakersDropdown
                    bakers={getBakersQuery?.data}
                    onSelect={handleBakerSelect}
                    isDelegated={isDelegated}
                    DelegatedAddress={statusQuery?.data?.DelegatedAddress}
                  />
                )}
              {getDataBaker.isPending && <p>Loading baker data ...</p>}
              {getDataBaker.isError && <p>Error loading bakers</p>}
              {getDataBaker.data && (
                <BakerDetails
                  baker={getDataBaker.data}
                  DelegatedDate={statusQuery?.data?.DelegatedDate}
                />
              )}
              {getDataBaker.data && getWalletBalance.data && (
                <RewardsSection
                  baker={getDataBaker.data}
                  walletBalance={getWalletBalance.data}
                  StatusData={statusQuery?.data}
                />
              )}
              <FAQ></FAQ>
            </BigLoader>
          </>
        )}

      <Sprites></Sprites>
    </div>
  );
}
