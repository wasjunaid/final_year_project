import { useState, useEffect } from 'react';
import type { HospitalPanelListModel } from '../../models/hospitalPanelList/model';
import type { CreateHospitalPanelListPayload } from '../../models/hospitalPanelList/payload';

// Factory to create hospital panel list controller hook with DI for repository
export const createUseHospitalPanelListController = ({ hospitalPanelListRepository }: { hospitalPanelListRepository: any }) => {
  return () => {
    const [hospitalPanelList, setHospitalPanelList] = useState<HospitalPanelListModel[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Fetch all hospital panel list
    const fetchHospitalPanelList = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await hospitalPanelListRepository.getAllHospitalPanelList();
        setHospitalPanelList(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch hospital panel list');
      } finally {
        setLoading(false);
      }
    };

    // Add insurance company to hospital panel
    const addToHospitalPanel = async (payload: CreateHospitalPanelListPayload) => {
      try {
        setLoading(true);
        setError(null);
        setSuccess(null);

        const newPanel = await hospitalPanelListRepository.createHospitalPanelList(payload);
        setHospitalPanelList((prev) => [...prev, newPanel]);
        setSuccess('Insurance company added to panel successfully!');
        
        return newPanel;
      } catch (err: any) {
        setError(err.message || 'Failed to add insurance company to panel');
        throw err;
      } finally {
        setLoading(false);
      }
    };

    // Remove insurance company from hospital panel
    const removeFromHospitalPanel = async (hospitalPanelListId: number) => {
      try {
        setLoading(true);
        setError(null);
        setSuccess(null);

        await hospitalPanelListRepository.deleteHospitalPanelList(hospitalPanelListId);
        setHospitalPanelList((prev) =>
          prev.filter((panel) => panel.hospital_panel_list_id !== hospitalPanelListId)
        );
        setSuccess('Insurance company removed from panel successfully!');
      } catch (err: any) {
        setError(err.message || 'Failed to remove insurance company from panel');
        throw err;
      } finally {
        setLoading(false);
      }
    };

    // Clear messages
    const clearMessages = () => {
      setError(null);
      setSuccess(null);
    };

    // Auto-fetch on mount
    useEffect(() => {
      fetchHospitalPanelList();
    }, []);

    return {
      hospitalPanelList,
      loading,
      error,
      success,
      fetchHospitalPanelList,
      addToHospitalPanel,
      removeFromHospitalPanel,
      clearMessages,
    };
  };
};
