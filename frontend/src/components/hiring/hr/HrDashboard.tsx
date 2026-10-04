import {
  Box,
  Container,
  VStack,
  Text,
  Card,
  CardHeader,
  CardBody,
  Heading,
} from '@chakra-ui/react';
import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { applicationService } from '../../../services/applicationService';
import { useJobs } from '../../../hooks/useJobs';
import { PageHeader } from '../shared/PageHeader';
import { StatsGrid } from '../shared/StatsGrid';
import { DataTable } from '../shared/DataTable';
import { StatusBadge } from '../../ui/status-badge';
import type { Application } from '../../../types';
import { ActionButtons } from '../shared/ActionButtons';

export const HrDashboard = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const { jobs } = useJobs();
  const location = useLocation();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchApplicationsWithFullData = async () => {
      try {
        setLoading(true);
        const basicApplications = await applicationService.getAllApplications();

        const fullApplications = await Promise.all(
          basicApplications.map(async (app) => {
            try {
              const fullApp = await applicationService.getApplicationById(
                app.id
              );
              return fullApp;
            } catch (error) {
              console.log(
                `[v0] Failed to fetch full data for application ${app.id}:`,
                error
              );
              return app;
            }
          })
        );

        setApplications(fullApplications);
        console.log(
          '[v0] Fetched applications with aiScreenings:',
          fullApplications
        );
      } catch (error) {
        console.error('[v0] Error fetching applications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplicationsWithFullData();
  }, []);

  const queryParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );
  const jobIdFilter = queryParams.get('jobId')
    ? Number(queryParams.get('jobId'))
    : null;

  const filteredJobTitle = useMemo(() => {
    if (jobIdFilter) {
      const job = jobs.find((j) => j.id === jobIdFilter);
      return job ? job.title : null;
    }
    return null;
  }, [jobIdFilter, jobs]);

  const handleViewApplication = (applicationId: string) => {
    navigate(`/hr/applications/${applicationId}`);
  };

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || app.overallStatus === statusFilter;
    const matchesJob = jobIdFilter === null || app.jobId === jobIdFilter;

    return matchesSearch && matchesStatus && matchesJob;
  });

  const stats = [
    {
      label: 'Total Applications',
      value: filteredApplications.length,
      helpText: filteredJobTitle ? `for ${filteredJobTitle}` : 'All time',
    },
    {
      label: 'Pending Review',
      value: filteredApplications.filter(
        (app) => app.currentRound === 'CV Screening'
      ).length,
      helpText: 'CV Screening',
      color: 'yellow.500',
    },
    {
      label: 'Technical Stage',
      value: filteredApplications.filter(
        (app) => app.currentRound === 'Technical Interview'
      ).length,
      helpText: 'Assessment',
      color: 'orange.500',
    },
    {
      label: 'Interviews',
      value: filteredApplications.filter(
        (app) => app.currentRound === 'HR Interview'
      ).length,
      helpText: 'Scheduled',
      color: 'cyan.500',
    },
    {
      label: 'Accepted',
      value: filteredApplications.filter(
        (app) =>
          app.currentRound === 'Completed' || app.overallStatus === 'Selected'
      ).length,
      helpText: 'Hired',
      color: 'green.500',
    },
  ];

  const columns = [
    {
      key: 'candidate',
      label: 'Candidate',
      render: (_: string, row: Application) => (
        <VStack align="start" spacing={1}>
          <Text fontWeight="medium">{row.name}</Text>
          <Text fontSize="sm" color="gray.500">
            {row.email}
          </Text>
        </VStack>
      ),
    },
    {
      key: 'position',
      label: 'Position',
      render: (_: string, row: Application) => (
        <VStack align="start" spacing={1}>
          <Text fontWeight="medium">{row.Job?.title}</Text>
        </VStack>
      ),
    },
    {
      key: 'cvScore',
      label: 'AI Screening',
      render: (_: string, row: Application) => {
        if (Array.isArray(row.aiScreenings) && row.aiScreenings.length > 0) {
          const latest = row.aiScreenings[row.aiScreenings.length - 1];
          return (
            <VStack align="start" spacing={1}>
              <StatusBadge
                status={latest.decision}
                variant="subtle"
                size="sm"
              />
              <Text fontSize="xs" color="gray.500">
                Score: {latest.score}%
              </Text>
            </VStack>
          );
        }

        if (row.cvStatus && row.cvStatus !== 'Pending') {
          return (
            <VStack align="start" spacing={1}>
              <StatusBadge status={row.cvStatus} variant="subtle" size="sm" />
              <Text fontSize="xs" color="gray.400">
                No AI screening yet
              </Text>
            </VStack>
          );
        }
      },
    },
    {
      key: 'overallStatus',
      label: 'Status',
      render: (value: string) => (
        <StatusBadge status={value} variant="subtle" />
      ),
    },
    {
      key: 'createdAt',
      label: 'Applied',
      render: (value: string) => (
        <Text fontSize="sm">{new Date(value).toLocaleDateString()}</Text>
      ),
    },
    {
      key: 'currentRound',
      label: 'Round',
      render: (value: string) => (
        <StatusBadge status={value} variant="subtle" />
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: string, row: Application) => (
        <ActionButtons
          onView={() => handleViewApplication(row.id)}
          showEdit={false}
          showDelete={false}
        />
      ),
    },
  ];

  const filterOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'In Progress', label: 'In Progress' },
    { value: 'Selected', label: 'Selected' },
    { value: 'Rejected', label: 'Rejected' },
  ];

  if (loading) {
    return (
      <Box minH="100vh" bg="gray.50">
        <PageHeader
          title="Dashboard"
          subtitle="Loading applications..."
          backLink={{ to: '/hr/job-space', label: 'Back to Space' }}
        />
        <Container maxW="7xl" py={8}>
          <Text>Loading applications with AI screening data...</Text>
        </Container>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="gray.50">
      <PageHeader
        title="Dashboard"
        subtitle={`Applications for: ${filteredJobTitle}`}
        backLink={{ to: '/hr/job-space', label: 'Back to Space' }}
      />

      <Container maxW="7xl" py={8}>
        <VStack spacing={8} align="stretch">
          <StatsGrid stats={stats} />

          <Card>
            <CardHeader>
              <Heading size="md">Applications</Heading>
            </CardHeader>
            <CardBody>
              <DataTable
                data={filteredApplications}
                columns={columns}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                filterValue={statusFilter}
                onFilterChange={setStatusFilter}
                filterOptions={filterOptions}
                emptyMessage="No applications found matching your criteria."
              />
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Box>
  );
};
