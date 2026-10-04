/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Box,
  Button,
  Container,
  Flex,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Heading,
  Input,
  Text,
  VStack,
  useToast,
  Icon,
  Link as ChakraLink,
} from '@chakra-ui/react';
import { FaArrowLeft } from 'react-icons/fa';
import { Link, useNavigate, useParams } from 'react-router-dom';
import * as Yup from 'yup';
import { Field, Form, Formik, type FieldProps } from 'formik';
import { applicationService } from '../../services/applicationService';

interface FormValues {
  name: string;
  email: string;
  phone: string;
  cvLink: File | null;
  jobId: number;
}

const validationSchema = Yup.object({
  name: Yup.string().required('Full name is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  phone: Yup.string()
    .required('Phone number is required')
    .matches(/^[+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number'), // Added phone validation
  cvLink: Yup.mixed<File>()
    .required('CV file is required')
    .test(
      'fileSize',
      'File size too large (max 5MB)',
      (value): value is File => !!value && value.size <= 5 * 1024 * 1024
    ),
});

export const ApplicationForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const initialValues: FormValues = {
    name: '',
    email: '',
    phone: '',
    cvLink: null,
    jobId: Number.parseInt(id!),
  };

  const handleSubmit = async (values: FormValues) => {
    console.log({ values });
    try {
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('email', values.email);
      formData.append('phone', values.phone);
      formData.append('jobId', String(values.jobId));
      if (values.cvLink) {
        formData.append('cvLink', values.cvLink);
      }

      console.log({ formData });

      const response = await applicationService.submitApplication(formData);

      if (response?.data?.id) {
        try {
          await new Promise((resolve) => setTimeout(resolve, 1000));

          const screeningResponse = await applicationService.analyzeCv(
            response.data.id
          );
          console.log(
            'CV screening completed automatically:',
            screeningResponse
          );

          toast({
            title: 'Application Submitted Successfully!',
            description:
              'Your application has been received and CV screening has been completed automatically.',
            status: 'success',
            duration: 5000,
            isClosable: true,
            position: 'top-right',
          });
        } catch (screeningError) {
          console.error('Auto CV screening failed:', screeningError);
          toast({
            title: 'Application Submitted Successfully!',
            description:
              'Your application has been received. CV screening will be processed shortly.',
            status: 'success',
            duration: 5000,
            isClosable: true,
            position: 'top-right',
          });
        }
      } else {
        toast({
          title: 'Application Submitted Successfully!',
          description:
            'Your application has been received and is being processed.',
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'top-right',
        });
      }

      navigate('/application-success', { state: response });
    } catch (error: any) {
      let errorMessage =
        'There was an error submitting your application. Please try again.';
      if (error.response?.data) {
        errorMessage = error.response.data.error || errorMessage;
      }
      toast({
        title: 'Submission Failed',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      });
    }
  };

  return (
    <Box
      minH="100vh"
      bg="blue.600"
      bgGradient="linear(45deg, blue.600, blue.700, purple.600)"
    >
      <Container maxW="2xl" py={12}>
        <ChakraLink
          as={Link}
          to={`/jobs/${id}`}
          display="flex"
          alignItems="center"
          mb={6}
          color="white"
        >
          <Icon as={FaArrowLeft} mr={2} />
          Back to Job Details
        </ChakraLink>
        <Box bg="white" p={8} borderRadius="lg" shadow="lg">
          <VStack align="stretch" spacing={6} mb={8}>
            <Heading size="lg">Apply for Position</Heading>
            <Text color="gray.600">
              Fill out the form below to submit your application. All fields are
              required.
            </Text>
          </VStack>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, errors, touched }) => (
              <Form>
                <VStack spacing={6} align="stretch">
                  <Flex gap={4} direction={{ base: 'column', md: 'row' }}>
                    <Field name="name">
                      {({ field }: FieldProps) => (
                        <FormControl isInvalid={!!errors.name && touched.name}>
                          <FormLabel>Full Name</FormLabel>
                          <Input {...field} placeholder="John Doe" />
                          <FormErrorMessage>{errors.name}</FormErrorMessage>
                        </FormControl>
                      )}
                    </Field>
                    <Field name="email">
                      {({ field }: FieldProps) => (
                        <FormControl
                          isInvalid={!!errors.email && touched.email}
                        >
                          <FormLabel>Email Address</FormLabel>
                          <Input
                            {...field}
                            type="email"
                            placeholder="john@example.com"
                          />
                          <FormErrorMessage>{errors.email}</FormErrorMessage>
                        </FormControl>
                      )}
                    </Field>
                  </Flex>
                  <Field name="phone">
                    {({ field }: FieldProps) => (
                      <FormControl isInvalid={!!errors.phone && touched.phone}>
                        <FormLabel>Phone Number</FormLabel>
                        <Input
                          {...field}
                          type="tel"
                          placeholder="+1 (555) 123-4567"
                        />
                        <FormErrorMessage>{errors.phone}</FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>
                  <Field name="cvLink">
                    {({ form }: FieldProps) => (
                      <FormControl
                        isInvalid={!!errors.cvLink && touched.cvLink}
                      >
                        <FormLabel>Upload Resume/CV</FormLabel>
                        <Input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={(event) =>
                            form.setFieldValue(
                              'cvLink',
                              event.currentTarget.files?.[0] || null
                            )
                          }
                        />
                        <FormErrorMessage>
                          {errors.cvLink as string}
                        </FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>
                  <Button
                    type="submit"
                    bg="blue.600"
                    _hover={{ bg: 'blue.700' }}
                    color="white"
                    size="lg"
                    isLoading={isSubmitting}
                  >
                    Submit Application
                  </Button>
                </VStack>
              </Form>
            )}
          </Formik>
        </Box>
      </Container>
    </Box>
  );
};
