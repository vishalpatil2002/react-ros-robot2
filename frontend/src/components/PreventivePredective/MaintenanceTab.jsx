import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Box,
} from "@mui/material";

// Mock data for preventive and predictive tasks
const preventiveTasks = [
  {
    id: 1,
    task: "Wheel Inspection",
    dueDate: "2025-12-15",
    status: "Pending",
    instructions: "Inspect wheels for wear and tear, clean debris, and lubricate bearings.",
  },
  {
    id: 2,
    task: "Battery Replacement",
    dueDate: "2025-08-03",
    status: "Pending",
    instructions: "Replace the battery and ensure proper connections.",
  },
];

const predictiveTasks = [
  {
    id: 1,
    component: "Motor",
    health: "90%",
    prediction: "Expected a service After 3 Months",
    recommendation: "Inspect motor bearings and reduce load capacity.",
  },
  {
    id: 2,
    component: "Battery",
    health: "98%",
    prediction: "Expected an Inspection After 8 Months",
    recommendation: "Replace battery soon to avoid downtime.",
  },
];

const MaintenanceTab = () => {
  const [preventiveData, setPreventiveData] = useState([]);
  const [predictiveData, setPredictiveData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Simulate fetching data from an API
  useEffect(() => {
    setTimeout(() => {
      setPreventiveData(preventiveTasks);
      setPredictiveData(predictiveTasks);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* Preventive Maintenance Section */}
      <Typography variant="h5" gutterBottom>
        Preventive Maintenance
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead style={{borderBottom:"2px solid black"}}>
            <TableRow>
              <TableCell>Task</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Instructions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {preventiveData.map((task) => (
              <TableRow key={task.id}>
                <TableCell>{task.task}</TableCell>
                <TableCell>{task.dueDate}</TableCell>
                <TableCell>
                  <Alert severity={task.status === "Pending" ? "warning" : "success"}>
                    {task.status}
                  </Alert>
                </TableCell>
                <TableCell>{task.instructions}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Predictive Maintenance Section */}
      <Typography variant="h5" gutterBottom mt={4}>
        Predictive Maintenance
      </Typography>
      <TableContainer component={Paper} style={{}}>
        <Table>
          <TableHead style={{borderBottom:"2px solid black"}}>
            <TableRow>
              <TableCell>Component</TableCell>
              <TableCell>Health</TableCell>
              <TableCell>Prediction</TableCell>
              <TableCell>Recommendation</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {predictiveData.map((task) => (
              <TableRow key={task.id}>
                <TableCell>{task.component}</TableCell>
                <TableCell>
                  <Box
                    sx={{
                      width: "100%",
                      backgroundColor: task.health > 80 ? "green" : task.health > 60 ? "orange" : "#00c04b",
                      color: "white",
                      textAlign: "center",
                      borderRadius: "4px",
                      padding: "4px",
                    }}
                  >
                    {task.health}
                  </Box>
                </TableCell>
                <TableCell>{task.prediction}</TableCell>
                <TableCell>{task.recommendation}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default MaintenanceTab;