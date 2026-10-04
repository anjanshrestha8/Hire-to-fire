import {
  Box,
  Container,
  VStack,
  Text,
  Button,
  Card,
  CardBody,
  Heading,
  useToast,
  HStack,
  Link as ChakraLink,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  Menu,
  MenuButton,
  Avatar,
  MenuList,
  MenuItem,
  Badge,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverArrow,
  PopoverCloseButton,
} from '@chakra-ui/react';
import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PageHeader } from '../shared/PageHeader';
import { DataTable } from '../shared/DataTable';
import { StatusBadge } from '../../ui/StatusBadge';
import type { Job } from '../../../types';
import { useJobs } from '../../../hooks/useJobs';
import { useApplications } from '../../../hooks/useApplications';
import { LoadingSpinner } from '../../ui/LoadingSpinner';
import { ErrorAlert } from '../../ui/ErrorAlert';
import { ActionButtons } from '../shared/ActionButtons';
import { FaSignOutAlt, FaBell } from 'react-icons/fa';
import { useAuth } from '../../../hooks/useAuth';
import { GrSystem } from 'react-icons/gr';

export const JobSpace = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { jobs, loading, error, deleteJob } = useJobs();
  const { applications } = useApplications();
  const { user, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [notificationsViewed, setNotificationsViewed] = useState(false);
  const [clearedNotifications, setClearedNotifications] = useState<Set<string>>(
    new Set()
  );

  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [jobToDeleteId, setJobToDeleteId] = useState<number | null>(null);
  const [jobToDeleteTitle, setJobToDeleteTitle] = useState<string>('');

  const getNewApplicationsCount = () => {
    if (notificationsViewed) return 0;

    return applications.filter(
      (app) =>
        new Date(app.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000) &&
        !clearedNotifications.has(app.id)
    ).length;
  };

  const newApplicationsCount = getNewApplicationsCount();

  const handleDeleteJobClick = (jobId: number, jobTitle: string) => {
    setJobToDeleteId(jobId);
    setJobToDeleteTitle(jobTitle);
    onOpen();
  };

  const confirmDelete = async () => {
    if (jobToDeleteId !== null) {
      try {
        await deleteJob(jobToDeleteId);
        toast({
          title: 'Job Deleted',
          description: 'The job posting has been successfully removed.',
          status: 'success',
          duration: 3000,
          position: 'top-right',
          isClosable: true,
        });
      } catch (error) {
        console.error('Failed to delete job:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete job posting.',
          status: 'error',
          duration: 5000,
          position: 'top-right',
          isClosable: true,
        });
      } finally {
        onClose();
        setJobToDeleteId(null);
        setJobToDeleteTitle('');
      }
    }
  };

  const handleEditJob = (jobId: number) => {
    navigate(`/hr/jobs/edit/${jobId}`);
  };

  const handleLogout = () => {
    logout();
    toast({
      title: 'Logged out successfully',
      status: 'info',
      duration: 3000,
      position: 'top-right',
      isClosable: true,
    });
    navigate('/hr/login');
  };

  const handleNotificationOpen = () => {
    setNotificationsViewed(true);
  };

  const handleClearAllNotifications = () => {
    const recentAppIds = applications
      .filter(
        (app) =>
          new Date(app.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)
      )
      .map((app) => app.id);

    setClearedNotifications(new Set(recentAppIds));
    setNotificationsViewed(true);

    toast({
      title: 'Notifications cleared',
      description: 'All notifications have been cleared.',
      status: 'success',
      duration: 2000,
      position: 'top-right',
      isClosable: true,
    });
  };
  const handleOfficeDashboard = () =>{
    window.location.href = "http://localhost:5174/login"
  }

  const filteredJobs = jobs?.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || job.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const columns = [
    {
      key: 'title',
      label: 'Job Title',
      render: (_: string, row: Job) => {
        return (
          <VStack align="start" spacing={1}>
            <HStack>
              <ChakraLink
                as={Link}
                to={`/hr/dashboard?jobId=${row.id}`}
                fontWeight="medium"
                color="blue.600"
                _hover={{ textDecoration: 'underline' }}
              >
                {row.title}
              </ChakraLink>
            </HStack>
            <Text fontSize="sm" color="gray.500">
              {row.company}
            </Text>
          </VStack>
        );
      },
    },
    {
      key: 'location',
      label: 'Location',
      render: (value: string) => <Text fontSize="sm">{value}</Text>,
    },
    {
      key: 'type',
      label: 'Type',
      render: (value: string) => (
        <StatusBadge status={value} variant="subtle" />
      ),
    },
    {
      key: 'salary',
      label: 'Salary',
      render: (value: string) => (
        <Text fontSize="sm" color="gray.600">
          {value || 'N/A'}
        </Text>
      ),
    },
    {
      key: 'posted',
      label: 'Posted',
      render: (value: string) => (
        <Text fontSize="sm">{new Date(value).toLocaleDateString()}</Text>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: string, row: Job) => (
        <ActionButtons
          onEdit={() => handleEditJob(row.id)}
          onDelete={() => handleDeleteJobClick(row.id, row.title)}
          showEdit={true}
          showDelete={true}
          showView={false}
        />
      ),
    },
  ];

  const filterOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'Full-time', label: 'Full-time' },
    { value: 'Part-time', label: 'Part-time' },
    { value: 'Contract', label: 'Contract' },
    { value: 'Internship', label: 'Internship' },
  ];

  const getRecentApplications = () => {
    return applications.filter(
      (app) =>
        new Date(app.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000) &&
        !clearedNotifications.has(app.id)
    );
  };

  const recentApplications = getRecentApplications();

  const headerActions = (
<HStack  align="center">
  <Popover onOpen={handleNotificationOpen}>
    <PopoverTrigger>
      <Button
        variant="ghost"
        leftIcon={<FaBell />}
        position="relative"
        _hover={{ bg: 'blue.50' }}
        borderRadius="lg"
      >
        {newApplicationsCount > 0 && (
          <Badge
            position="absolute"
            top="-1"
            right="-1"
            colorScheme="red"
            borderRadius="full"
            fontSize="xs"
            minW="20px"
            h="20px"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            {newApplicationsCount}
          </Badge>
        )}
      </Button>
    </PopoverTrigger>
    <PopoverContent w="350px" boxShadow="xl" borderRadius="lg">
      <PopoverArrow />
      <PopoverCloseButton />
      <PopoverHeader fontWeight="bold" bg="blue.50" borderTopRadius="lg">
        <HStack justify="space-between" align="center">
          <Text>Recent Applications ({recentApplications.length})</Text>
          {recentApplications.length > 0 && (
            <Button
              size="xs"
              variant="ghost"
              colorScheme="red"
              onClick={handleClearAllNotifications}
              _hover={{ bg: 'red.50' }}
            >
              Clear All
            </Button>
          )}
        </HStack>
      </PopoverHeader>
      <PopoverBody p={0}>
        {recentApplications.length > 0 ? (
          <VStack align="stretch" spacing={0} maxH="300px" overflowY="auto">
            {recentApplications.map((app) => (
              <Box
                key={app.id}
                p={3}
                borderBottomWidth={1}
                borderColor="gray.100"
                cursor="pointer"
                _hover={{ bg: 'blue.50' }}
                transition="background-color 0.2s"
                onClick={() => navigate(`/hr/dashboard?jobId=${app.jobId}`)}
              >
                <HStack justify="space-between" align="start">
                  <VStack align="start" spacing={1} flex={1}>
                    <HStack>
                      <Avatar size="xs" name={app.name} />
                      <Text
                        fontSize="sm"
                        fontWeight="semibold"
                        color="gray.800"
                      >
                        {app.name}
                      </Text>
                    </HStack>
                    <Text
                      fontSize="xs"
                      color="blue.600"
                      fontWeight="medium"
                    >
                      {app.Job?.title}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {new Date(app.createdAt).toLocaleString()}
                    </Text>
                  </VStack>
                </HStack>
              </Box>
            ))}
          </VStack>
        ) : (
          <Box p={4} textAlign="center">
            <Text fontSize="sm" color="gray.500">
              No recent applications
            </Text>
          </Box>
        )}
      </PopoverBody>
    </PopoverContent>
  </Popover>

  {/* User Menu */}
  <Menu>
    <MenuButton
      as={Button}
      variant="ghost"
      rightIcon={<Avatar size="sm" name={user?.name} />}
    >
      <VStack align="end" spacing={0}>
        <Text fontSize="sm" fontWeight="medium">
          {user?.name}
        </Text>
        <Text fontSize="xs" color="gray.500">
          {user?.role}
        </Text>
      </VStack>
    </MenuButton>
    <MenuList>
      <MenuItem icon={<FaSignOutAlt />} onClick={handleLogout}>
        Logout
      </MenuItem>
      <MenuItem icon={<GrSystem />} onClick={handleOfficeDashboard}>
        Office dashboard
      </MenuItem>
    </MenuList>
  </Menu>
</HStack>

  );

  if (loading) {
    return <LoadingSpinner message="Loading job listings..." />;
  }

  if (error) {
    return (
      <Box minH="100vh" bg="gray.50">
        <Container maxW="7xl" py={8}>
          <ErrorAlert
            message={error}
            onRetry={() => window.location.reload()}
          />
        </Container>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="gray.50">
      <PageHeader
        title="Job Management"
        subtitle="Manage your job postings and track applications"
        actions={headerActions}
      />

      <Container maxW="7xl" py={8}>
        <VStack spacing={6} align="stretch">
          <Card>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between" align="center">
                  <Heading size="md">Job Postings</Heading>
                  <Button
                    colorScheme="blue"
                    onClick={() => navigate('/hr/jobs/create')}
                    size="sm"
                  >
                    Create Job
                  </Button>
                </HStack>
                <DataTable
                  data={filteredJobs}
                  columns={columns}
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  filterValue={typeFilter}
                  onFilterChange={setTypeFilter}
                  filterOptions={filterOptions}
                  emptyMessage="No job postings found matching your criteria."
                />
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Container>

      {/* Delete Confirmation AlertDialog */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Job Posting
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete the job posting for "
              <Text as="span" fontWeight="bold">
                {jobToDeleteTitle}
              </Text>
              "? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={confirmDelete} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};
