import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  VStack,
  HStack,
  Flex,
  Spinner,
  Input,
  InputGroup,
  InputLeftElement,
  Button,
  Select,
  RangeSlider,
  RangeSliderTrack,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  Icon,
  Wrap,
  WrapItem,
  Card,
  CardBody,
  useColorModeValue,
  Divider,
} from '@chakra-ui/react';
import {
  FaSearch,
  FaMapMarkerAlt,
  FaBriefcase,
  FaDollarSign,
  FaFilter,
  FaBuilding,
  FaUsers,
  FaChartLine,
} from 'react-icons/fa';
import { CgLock } from 'react-icons/cg';
import { FaUserSecret, FaUserShield } from 'react-icons/fa';
import { JobCard } from '../components/ui/job-card';
import { jobService } from '../services/jobService';
import { useEffect, useState } from 'react';
import type { Job } from '../types';

export const HiringHome = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [salaryRange, setSalaryRange] = useState([0, 200000]);
  const [showFilters, setShowFilters] = useState(false);
  const [skillsFilter, setSkillsFilter] = useState('');
  const [experienceFilter, setExperienceFilter] = useState('');

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const searchBg = useColorModeValue('white', 'gray.700');

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const data = await jobService.getAllJobs();
        setJobs(data);
      } catch (error) {
        console.error('Failed to fetch jobs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter((job) => {
    const searchLower = searchTerm.toLowerCase();

    const matchesSearch =
      !searchTerm ||
      job.title.toLowerCase().includes(searchLower) ||
      job.company.toLowerCase().includes(searchLower) ||
      job.description.toLowerCase().includes(searchLower) ||
      job.requirements.some((req) => req.toLowerCase().includes(searchLower)) ||
      job.responsibilities.some((resp) =>
        resp.toLowerCase().includes(searchLower)
      ) ||
      job.benefits.some((benefit) =>
        benefit.toLowerCase().includes(searchLower)
      ) ||
      job.location.toLowerCase().includes(searchLower);

    const matchesLocation =
      !locationFilter ||
      job.location.toLowerCase().includes(locationFilter.toLowerCase());

    const matchesType = !typeFilter || job.type === typeFilter;

    const matchesSkills =
      !skillsFilter ||
      job.requirements.some((req) =>
        req.toLowerCase().includes(skillsFilter.toLowerCase())
      ) ||
      job.title.toLowerCase().includes(skillsFilter.toLowerCase());

    const matchesExperience =
      !experienceFilter ||
      job.requirements.some((req) =>
        req.toLowerCase().includes(experienceFilter.toLowerCase())
      ) ||
      job.description.toLowerCase().includes(experienceFilter.toLowerCase());

    const jobSalary = Number.parseInt(job.salary.replace(/[^0-9]/g, '')) || 0;
    const matchesSalary =
      jobSalary >= salaryRange[0] && jobSalary <= salaryRange[1];

    return (
      matchesSearch &&
      matchesLocation &&
      matchesType &&
      matchesSkills &&
      matchesExperience &&
      matchesSalary
    );
  });

  const quickFilters = [
    { label: 'Full-time', value: 'Full-time', icon: FaBriefcase, type: 'type' },
    { label: 'Part-time', value: 'Part-time', icon: FaBriefcase, type: 'type' },
    { label: 'Contract', value: 'Contract', icon: FaChartLine, type: 'type' },
    {
      label: 'Internship',
      value: 'Internship',
      icon: FaUserShield,
      type: 'type',
    },
  ];

  const handleQuickFilter = (filterType: string, value: string) => {
    if (filterType === 'type') {
      setTypeFilter(typeFilter === value ? '' : value);
    }
  };

  return (
    <Box minH="100vh" bg={bgColor}>
      <Box
        py={16}
        bg="blue.600"
        color="white"
        position="relative"
        overflow="hidden"
      >
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bgGradient="linear(45deg, blue.600, blue.700, purple.600)"
          opacity="0.9"
        />
        <Container maxW="7xl" position="relative" zIndex="1">
          <VStack spacing={8} textAlign="center">
            <VStack spacing={4}>
              <Heading
                size="2xl"
                fontWeight="bold"
                textShadow="0 2px 4px rgba(0,0,0,0.3)"
              >
                Find Your Dream Job Today
              </Heading>
              <Text fontSize="xl" maxW="2xl" opacity="0.9">
                Search by skills, requirements, and qualifications. Our
                intelligent matching finds jobs that fit your expertise
                perfectly.
              </Text>
            </VStack>

            <Box w="full" maxW="4xl">
              <VStack spacing={4}>
                <InputGroup size="lg">
                  <InputLeftElement>
                    <Icon as={FaSearch} color="gray.400" />
                  </InputLeftElement>
                  <Input
                    placeholder="Search by job title, skills, requirements, or company..."
                    bg={searchBg}
                    color="gray.800"
                    border="none"
                    borderRadius="xl"
                    fontSize="lg"
                    py={6}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    _focus={{ boxShadow: '0 0 0 3px rgba(66, 153, 225, 0.6)' }}
                  />
                </InputGroup>

                <Wrap justify="center" spacing={3}>
                  {quickFilters.map((filter) => (
                    <WrapItem key={filter.value}>
                      <Button
                        leftIcon={<Icon as={filter.icon} />}
                        variant={
                          filter.type === 'type' && typeFilter === filter.value
                            ? 'solid'
                            : 'outline'
                        }
                        colorScheme={
                          filter.type === 'type' && typeFilter === filter.value
                            ? 'white'
                            : 'whiteAlpha'
                        }
                        size="sm"
                        borderRadius="full"
                        onClick={() =>
                          handleQuickFilter(filter.type, filter.value)
                        }
                      >
                        {filter.label}
                      </Button>
                    </WrapItem>
                  ))}
                </Wrap>
              </VStack>
            </Box>
          </VStack>
        </Container>
      </Box>

      <Box py={6} bg={cardBg} borderBottom="1px" borderColor="gray.200">
        <Container maxW="7xl">
          <VStack spacing={4}>
            <Button
              leftIcon={<Icon as={FaFilter} />}
              variant="ghost"
              onClick={() => setShowFilters(!showFilters)}
              size="sm"
            >
              {showFilters ? 'Hide Filters' : 'Show Advanced Filters'}
            </Button>

            {showFilters && (
              <Card w="full" bg={cardBg}>
                <CardBody>
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
                    <VStack align="start" spacing={2}>
                      <HStack>
                        <Icon as={FaMapMarkerAlt} color="blue.500" />
                        <Text fontWeight="medium">Location</Text>
                      </HStack>
                      <Input
                        placeholder="Enter city or region"
                        value={locationFilter}
                        onChange={(e) => setLocationFilter(e.target.value)}
                      />
                    </VStack>

                    <VStack align="start" spacing={2}>
                      <HStack>
                        <Icon as={FaBriefcase} color="blue.500" />
                        <Text fontWeight="medium">Job Type</Text>
                      </HStack>
                      <Select
                        placeholder="Select job type"
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                      >
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Contract">Contract</option>
                        <option value="Internship">Internship</option>
                      </Select>
                    </VStack>

                    <VStack align="start" spacing={2}>
                      <HStack>
                        <Icon as={FaChartLine} color="blue.500" />
                        <Text fontWeight="medium">Skills</Text>
                      </HStack>
                      <Input
                        placeholder="e.g. React, Python, AWS"
                        value={skillsFilter}
                        onChange={(e) => setSkillsFilter(e.target.value)}
                      />
                    </VStack>

                    <VStack align="start" spacing={2}>
                      <HStack>
                        <Icon as={FaDollarSign} color="blue.500" />
                        <Text fontWeight="medium">Salary Range</Text>
                      </HStack>
                      <Box w="full" px={2}>
                        <RangeSlider
                          value={salaryRange}
                          onChange={setSalaryRange}
                          min={0}
                          max={200000}
                          step={5000}
                        >
                          <RangeSliderTrack>
                            <RangeSliderFilledTrack bg="blue.500" />
                          </RangeSliderTrack>
                          <RangeSliderThumb index={0} />
                          <RangeSliderThumb index={1} />
                        </RangeSlider>
                        <HStack justify="space-between" mt={2}>
                          <Text fontSize="sm" color="gray.600">
                            ${salaryRange[0].toLocaleString()}
                          </Text>
                          <Text fontSize="sm" color="gray.600">
                            ${salaryRange[1].toLocaleString()}+
                          </Text>
                        </HStack>
                      </Box>
                    </VStack>
                  </SimpleGrid>
                </CardBody>
              </Card>
            )}
          </VStack>
        </Container>
      </Box>

      <Box py={8}>
        <Container maxW="7xl">
          <VStack spacing={6} align="stretch">
            <HStack justify="space-between" align="center">
              <VStack align="start" spacing={1}>
                <Heading size="lg">
                  {searchTerm ||
                  locationFilter ||
                  typeFilter ||
                  skillsFilter ||
                  experienceFilter
                    ? 'Search Results'
                    : 'Latest Job Openings'}
                </Heading>
                <Text color="gray.600">
                  {filteredJobs.length} job
                  {filteredJobs.length !== 1 ? 's' : ''} found
                  {searchTerm && ` for "${searchTerm}"`}
                  {skillsFilter && ` with "${skillsFilter}" skills`}
                  {experienceFilter && ` for ${experienceFilter} level`}
                </Text>
              </VStack>

              {(searchTerm ||
                locationFilter ||
                typeFilter ||
                skillsFilter ||
                experienceFilter) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setLocationFilter('');
                    setTypeFilter('');
                    setSkillsFilter('');
                    setExperienceFilter('');
                    setSalaryRange([0, 200000]);
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </HStack>

            {loading ? (
              <Flex justify="center" align="center" minH="300px">
                <VStack spacing={4}>
                  <Spinner size="xl" color="blue.500" thickness="4px" />
                  <Text color="gray.600">Loading amazing opportunities...</Text>
                </VStack>
              </Flex>
            ) : filteredJobs.length > 0 ? (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                {filteredJobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </SimpleGrid>
            ) : (
              <Card bg={cardBg} textAlign="center" py={12}>
                <CardBody>
                  <VStack spacing={4}>
                    <Icon as={FaSearch} size="48px" color="gray.400" />
                    <VStack spacing={2}>
                      <Heading size="md" color="gray.600">
                        No jobs found
                      </Heading>
                      <Text color="gray.500">
                        Try adjusting your search criteria or browse all
                        available positions
                      </Text>
                    </VStack>
                    <Button
                      colorScheme="blue"
                      onClick={() => {
                        setSearchTerm('');
                        setLocationFilter('');
                        setTypeFilter('');
                      }}
                    >
                      View All Jobs
                    </Button>
                  </VStack>
                </CardBody>
              </Card>
            )}
          </VStack>
        </Container>
      </Box>

      <Box py={16} bg={cardBg}>
        <Container maxW="7xl">
          <VStack spacing={12}>
            <VStack spacing={4} textAlign="center">
              <Heading size="lg">How Hire Me Works</Heading>
              <Text color="gray.600" maxW="2xl">
                Our streamlined hiring process connects talented professionals
                with amazing companies
              </Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
              <Card
                bg="blue.50"
                border="1px"
                borderColor="blue.200"
                textAlign="center"
              >
                <CardBody>
                  <VStack spacing={4}>
                    <Flex
                      bg="blue.500"
                      w={16}
                      h={16}
                      rounded="full"
                      align="center"
                      justify="center"
                    >
                      <FaUserSecret size={24} color="white" />
                    </Flex>
                    <VStack spacing={2}>
                      <Heading size="md" color="blue.700">
                        1. Apply Instantly
                      </Heading>
                      <Text color="gray.600">
                        Submit your CV and get instantly screened by our AI
                        system for initial qualification matching and
                        compatibility assessment.
                      </Text>
                    </VStack>
                  </VStack>
                </CardBody>
              </Card>

              <Card
                bg="green.50"
                border="1px"
                borderColor="green.200"
                textAlign="center"
              >
                <CardBody>
                  <VStack spacing={4}>
                    <Flex
                      bg="green.500"
                      w={16}
                      h={16}
                      rounded="full"
                      align="center"
                      justify="center"
                    >
                      <CgLock size={24} color="white" />
                    </Flex>
                    <VStack spacing={2}>
                      <Heading size="md" color="green.700">
                        2. Technical Assessment
                      </Heading>
                      <Text color="gray.600">
                        Complete a 45-minute coding challenge with real-time
                        code execution, automatic evaluation, and detailed
                        feedback.
                      </Text>
                    </VStack>
                  </VStack>
                </CardBody>
              </Card>

              <Card
                bg="purple.50"
                border="1px"
                borderColor="purple.200"
                textAlign="center"
              >
                <CardBody>
                  <VStack spacing={4}>
                    <Flex
                      bg="purple.500"
                      w={16}
                      h={16}
                      rounded="full"
                      align="center"
                      justify="center"
                    >
                      <FaUserShield size={24} color="white" />
                    </Flex>
                    <VStack spacing={2}>
                      <Heading size="md" color="purple.700">
                        3. Final Interview
                      </Heading>
                      <Text color="gray.600">
                        Final interview via Google Meet with our HR team to
                        discuss culture fit, expectations, and next steps in
                        your journey.
                      </Text>
                    </VStack>
                  </VStack>
                </CardBody>
              </Card>
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      <Box bg="gray.900" color="white" py={12}>
        <Container maxW="7xl">
          <VStack spacing={6}>
            <HStack spacing={8} wrap="wrap" justify="center">
              <VStack spacing={2} align="center">
                <Icon as={FaBuilding} size="24px" color="blue.400" />
                <Text fontSize="sm" fontWeight="medium">
                  500+ Companies
                </Text>
              </VStack>
              <VStack spacing={2} align="center">
                <Icon as={FaBriefcase} size="24px" color="green.400" />
                <Text fontSize="sm" fontWeight="medium">
                  10,000+ Jobs
                </Text>
              </VStack>
              <VStack spacing={2} align="center">
                <Icon as={FaUsers} size="24px" color="purple.400" />
                <Text fontSize="sm" fontWeight="medium">
                  50,000+ Candidates
                </Text>
              </VStack>
            </HStack>

            <Divider borderColor="gray.700" />

            <VStack spacing={2} textAlign="center">
              <Text fontSize="lg" fontWeight="bold">
                Hire Me
              </Text>
              <Text fontSize="sm" color="gray.400">
                © 2024 Hire Me. Connecting talent with opportunity.
              </Text>
            </VStack>
          </VStack>
        </Container>
      </Box>
    </Box>
  );
};
