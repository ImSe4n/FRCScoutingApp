
/**
 * ScoutingApp.java
 * Main GUI driver for the FRC REBUILT 2026 scouting application.
 * Contains a 4-tab JTabbedPane: Scout Entry, Dashboard, Match Predictor, Pick List.
 * Wires together Tournament, Alliance, Match, and ScoutedRobot.
 */

import javax.swing.*;
import javax.swing.table.*;
import java.awt.*;
import java.util.ArrayList;

public class ScoutingApp extends JFrame {
    private Tournament tournament;

    // Scout Entry tab fields
    private JTextField txtTeamNumber;
    private JSpinner spnAutoFuel;
    private JSpinner spnTeleFuel;
    private JSpinner spnEndFuel;
    private JSpinner spnClimbLevel;
    private JSpinner spnDefenceTime;
    private JSpinner spnMinorPenalties;
    private JSpinner spnMajorPenalties;
    private JSpinner spnDriverRating;
    private JSpinner spnAccuracyRating;
    private JTextField txtNotes;
    private JLabel lblEntryStatus;

    // Dashboard tab
    private DefaultTableModel dashboardModel;

    // Match Predictor tab
    private JComboBox<String> cmbRed1;
    private JComboBox<String> cmbRed2;
    private JComboBox<String> cmbRed3;
    private JComboBox<String> cmbBlue1;
    private JComboBox<String> cmbBlue2;
    private JComboBox<String> cmbBlue3;
    private JTextArea txtMatchResult;

    // Pick List tab
    private JSlider sldFuelWeight;
    private JSlider sldClimbWeight;
    private JSlider sldDefenceWeight;
    private DefaultTableModel picklistModel;

    /**
     * Constructor: builds the JFrame, adds the JMenuBar and JTabbedPane with all 4
     * tabs.
     */
    public ScoutingApp() {
        this.tournament = new Tournament();

        this.setTitle("FRC REBUILT 2026 Scouting App");
        this.setSize(900, 620);
        this.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        this.setLocationRelativeTo(null);

        JTabbedPane tabbedPane = new JTabbedPane();
        tabbedPane.addTab("Scout Entry", this.scoutEntryTab());
        tabbedPane.addTab("Dashboard", this.dashboardTab());
        tabbedPane.addTab("Match Predictor", this.matchPredictorTab());
        tabbedPane.addTab("Pick List", this.picklistTab());

        // refresh combo boxes whenever the user switches to the Match Predictor tab
        tabbedPane.addChangeListener(e -> {
            if (tabbedPane.getSelectedIndex() == 2) {
                this.refreshComboBoxes();
            }
        });

        // File menu for save / load
        JMenuBar menuBar = new JMenuBar();
        JMenu fileMenu = new JMenu("File");
        JMenuItem saveItem = new JMenuItem("Save");
        JMenuItem loadItem = new JMenuItem("Load");
        saveItem.addActionListener(e -> this.saveFile());
        loadItem.addActionListener(e -> this.loadFile());
        fileMenu.add(saveItem);
        fileMenu.add(loadItem);
        menuBar.add(fileMenu);
        this.setJMenuBar(menuBar);

        // auto-save when the user closes the window
        this.addWindowListener(new java.awt.event.WindowAdapter(){
            @Override
            public void windowClosing(java.awt.event.WindowEvent e){
                ScoutingApp.this.tournament.saveToFile("scouting_data.txt");
            }
        });

        // auto-load any previously saved data; dashboardModel is ready at this point
        this.tournament.loadFromFile("scouting_data.txt");
        this.refreshDashboard();

        this.add(tabbedPane);
        this.setVisible(true);
    }

    // -------------------------------------------------------------------------
    // Tab builders
    // -------------------------------------------------------------------------

    /**
     * Tab 1 - Scout Entry: form fields for a single match observation.
     * Submit calls scoutedBotSubmit().
     */
    private JPanel scoutEntryTab() {
        JPanel panel = new JPanel(new BorderLayout());

        JPanel formPanel = new JPanel(new GridLayout(0, 2, 10, 5));
        formPanel.setBorder(BorderFactory.createEmptyBorder(10, 10, 10, 10));

        this.txtTeamNumber = new JTextField();
        this.spnAutoFuel = new JSpinner(new SpinnerNumberModel(0, 0, 999, 1));
        this.spnTeleFuel = new JSpinner(new SpinnerNumberModel(0, 0, 999, 1));
        this.spnEndFuel = new JSpinner(new SpinnerNumberModel(0, 0, 999, 1));
        this.spnClimbLevel = new JSpinner(new SpinnerNumberModel(0, 0, 3, 1));
        this.spnDefenceTime = new JSpinner(new SpinnerNumberModel(0, 0, 150, 1));
        this.spnMinorPenalties = new JSpinner(new SpinnerNumberModel(0, 0, 20, 1));
        this.spnMajorPenalties = new JSpinner(new SpinnerNumberModel(0, 0, 10, 1));
        this.spnDriverRating = new JSpinner(new SpinnerNumberModel(1, 1, 5, 1));
        this.spnAccuracyRating = new JSpinner(new SpinnerNumberModel(1, 1, 5, 1));
        this.txtNotes = new JTextField();

        formPanel.add(new JLabel("Team Number:"));
        formPanel.add(this.txtTeamNumber);
        formPanel.add(new JLabel("Auto Fuel Count:"));
        formPanel.add(this.spnAutoFuel);
        formPanel.add(new JLabel("Teleop Fuel Count:"));
        formPanel.add(this.spnTeleFuel);
        formPanel.add(new JLabel("Endgame Fuel Count:"));
        formPanel.add(this.spnEndFuel);
        formPanel.add(new JLabel("Climb Level (0-3):"));
        formPanel.add(this.spnClimbLevel);
        formPanel.add(new JLabel("Defence Time (seconds):"));
        formPanel.add(this.spnDefenceTime);
        formPanel.add(new JLabel("Minor Penalties:"));
        formPanel.add(this.spnMinorPenalties);
        formPanel.add(new JLabel("Major Penalties:"));
        formPanel.add(this.spnMajorPenalties);
        formPanel.add(new JLabel("Driver Rating (1-5):"));
        formPanel.add(this.spnDriverRating);
        formPanel.add(new JLabel("Accuracy Rating (1-5):"));
        formPanel.add(this.spnAccuracyRating);
        formPanel.add(new JLabel("Notes:"));
        formPanel.add(this.txtNotes);

        this.lblEntryStatus = new JLabel(" ");
        JButton btnSubmit = new JButton("Submit Observation");
        btnSubmit.addActionListener(e -> this.scoutedBotSubmit());

        JPanel bottomPanel = new JPanel(new BorderLayout());
        bottomPanel.setBorder(BorderFactory.createEmptyBorder(5, 10, 5, 10));
        bottomPanel.add(btnSubmit, BorderLayout.CENTER);
        bottomPanel.add(this.lblEntryStatus, BorderLayout.SOUTH);

        panel.add(new JScrollPane(formPanel), BorderLayout.CENTER);
        panel.add(bottomPanel, BorderLayout.SOUTH);

        return panel;
    }

    /**
     * Tab 2 - Dashboard: JTable showing averaged stats for all scouted robots.
     * Sortable by column header click. Refresh button repopulates from tournament.
     */
    private JPanel dashboardTab() {
        JPanel panel = new JPanel(new BorderLayout());

        String[] columns = { "Team #", "Avg Auto", "Avg Teleop", "Avg End", "Avg Score", "Matches" };
        this.dashboardModel = new DefaultTableModel(columns, 0) {
            @Override
            public boolean isCellEditable(int intRow, int intCol) {
                return false;
            }
        };

        JTable table = new JTable(this.dashboardModel);
        table.setAutoCreateRowSorter(true);

        JButton btnRefresh = new JButton("Refresh");
        btnRefresh.addActionListener(e -> this.refreshDashboard());

        panel.add(new JScrollPane(table), BorderLayout.CENTER);
        panel.add(btnRefresh, BorderLayout.SOUTH);

        return panel;
    }

    /**
     * Tab 3 - Match Predictor: 6 combo boxes (3 red, 3 blue) to pick alliances.
     * Simulate button builds a Match and shows getGameSummary() output.
     */
    private JPanel matchPredictorTab() {
        JPanel panel = new JPanel(new BorderLayout());

        JPanel selectionPanel = new JPanel(new GridLayout(6, 2, 10, 5));
        selectionPanel.setBorder(BorderFactory.createEmptyBorder(10, 10, 10, 10));

        this.cmbRed1 = new JComboBox<String>();
        this.cmbRed2 = new JComboBox<String>();
        this.cmbRed3 = new JComboBox<String>();
        this.cmbBlue1 = new JComboBox<String>();
        this.cmbBlue2 = new JComboBox<String>();
        this.cmbBlue3 = new JComboBox<String>();

        selectionPanel.add(new JLabel("Red Alliance 1:"));
        selectionPanel.add(this.cmbRed1);
        selectionPanel.add(new JLabel("Red Alliance 2:"));
        selectionPanel.add(this.cmbRed2);
        selectionPanel.add(new JLabel("Red Alliance 3:"));
        selectionPanel.add(this.cmbRed3);
        selectionPanel.add(new JLabel("Blue Alliance 1:"));
        selectionPanel.add(this.cmbBlue1);
        selectionPanel.add(new JLabel("Blue Alliance 2:"));
        selectionPanel.add(this.cmbBlue2);
        selectionPanel.add(new JLabel("Blue Alliance 3:"));
        selectionPanel.add(this.cmbBlue3);

        this.txtMatchResult = new JTextArea(5, 40);
        this.txtMatchResult.setEditable(false);
        this.txtMatchResult.setFont(new Font(Font.MONOSPACED, Font.PLAIN, 12));

        JButton btnSimulate = new JButton("Simulate Match");
        btnSimulate.addActionListener(e -> this.simulateMatch());

        JPanel bottomPanel = new JPanel(new BorderLayout());
        bottomPanel.setBorder(BorderFactory.createEmptyBorder(5, 10, 5, 10));
        bottomPanel.add(btnSimulate, BorderLayout.NORTH);
        bottomPanel.add(new JScrollPane(this.txtMatchResult), BorderLayout.CENTER);

        panel.add(selectionPanel, BorderLayout.NORTH);
        panel.add(bottomPanel, BorderLayout.CENTER);

        return panel;
    }

    /**
     * Tab 4 - Pick List: sliders for fuel/climb/defence weighting.
     * Generate button computes a weighted score per robot and displays ranked
     * JTable.
     */
    private JPanel picklistTab() {
        JPanel panel = new JPanel(new BorderLayout());

        JPanel weightPanel = new JPanel(new GridLayout(3, 2, 10, 5));
        weightPanel.setBorder(BorderFactory.createEmptyBorder(10, 10, 10, 10));

        this.sldFuelWeight = new JSlider(0, 10, 5);
        this.sldFuelWeight.setMajorTickSpacing(2);
        this.sldFuelWeight.setPaintTicks(true);
        this.sldFuelWeight.setPaintLabels(true);

        this.sldClimbWeight = new JSlider(0, 10, 5);
        this.sldClimbWeight.setMajorTickSpacing(2);
        this.sldClimbWeight.setPaintTicks(true);
        this.sldClimbWeight.setPaintLabels(true);

        this.sldDefenceWeight = new JSlider(0, 10, 5);
        this.sldDefenceWeight.setMajorTickSpacing(2);
        this.sldDefenceWeight.setPaintTicks(true);
        this.sldDefenceWeight.setPaintLabels(true);

        weightPanel.add(new JLabel("Fuel Scoring Weight:"));
        weightPanel.add(this.sldFuelWeight);
        weightPanel.add(new JLabel("Climb Points Weight:"));
        weightPanel.add(this.sldClimbWeight);
        weightPanel.add(new JLabel("Defence Effectiveness Weight:"));
        weightPanel.add(this.sldDefenceWeight);

        String[] columns = { "Rank", "Team #", "Weighted Score", "Matches Scouted" };
        this.picklistModel = new DefaultTableModel(columns, 0) {
            @Override
            public boolean isCellEditable(int intRow, int intCol) {
                return false;
            }
        };

        JTable table = new JTable(this.picklistModel);

        JButton btnGenerate = new JButton("Generate Pick List");
        btnGenerate.addActionListener(e -> this.generatePicklist());

        JPanel topPanel = new JPanel(new BorderLayout());
        topPanel.add(weightPanel, BorderLayout.CENTER);
        topPanel.add(btnGenerate, BorderLayout.SOUTH);

        panel.add(topPanel, BorderLayout.NORTH);
        panel.add(new JScrollPane(table), BorderLayout.CENTER);

        return panel;
    }

    // -------------------------------------------------------------------------
    // Event handlers
    // -------------------------------------------------------------------------

    /**
     * Reads the Scout Entry form, finds or creates the robot in the tournament,
     * then calls addMatchObservation() to update its running averages.
     */
    private void scoutedBotSubmit() {
        try {
            short shrTeamNumber = Short.parseShort(this.txtTeamNumber.getText().trim());
            short shrAutoFuel = (short) (int) this.spnAutoFuel.getValue();
            short shrTeleFuel = (short) (int) this.spnTeleFuel.getValue();
            short shrEndFuel = (short) (int) this.spnEndFuel.getValue();
            int intClimbLevel = (int) this.spnClimbLevel.getValue();
            byte bytDefenceTime = (byte) (int) this.spnDefenceTime.getValue();
            byte bytMinorPenalties = (byte) (int) this.spnMinorPenalties.getValue();
            byte bytMajorPenalties = (byte) (int) this.spnMajorPenalties.getValue();
            byte bytDriverRating = (byte) (int) this.spnDriverRating.getValue();
            byte bytAccuracyRating = (byte) (int) this.spnAccuracyRating.getValue();
            String strNotes = this.txtNotes.getText();

            // find robot; if not scouted yet, create a blank entry first
            ScoutedRobot robot = this.tournament.findRobot(shrTeamNumber);
            if (robot == null) {
                this.tournament.addRobot(shrTeamNumber);
                robot = this.tournament.findRobot(shrTeamNumber);
            }

            robot.addMatchObservation(shrAutoFuel, shrTeleFuel, shrEndFuel, intClimbLevel,
                    bytDefenceTime, bytMinorPenalties, bytMajorPenalties, bytDriverRating, bytAccuracyRating);
            robot.setNotes(strNotes);

            this.lblEntryStatus
                    .setText("Team " + shrTeamNumber + " updated. Observations: " + robot.getMatchesObserved());

            // reset form to defaults
            this.txtTeamNumber.setText("");
            this.txtNotes.setText("");
            this.spnAutoFuel.setValue(0);
            this.spnTeleFuel.setValue(0);
            this.spnEndFuel.setValue(0);
            this.spnClimbLevel.setValue(0);
            this.spnDefenceTime.setValue(0);
            this.spnMinorPenalties.setValue(0);
            this.spnMajorPenalties.setValue(0);
            this.spnDriverRating.setValue(1);
            this.spnAccuracyRating.setValue(1);
        } catch (NumberFormatException e) {
            this.lblEntryStatus.setText("Error: Invalid team number.");
        }
    }

    /**
     * Reads the 6 combo box selections, builds two Alliance objects and a Match,
     * then displays getGameSummary() in the result text area.
     * Shows an error message if fewer than 6 robots are selected or any are null.
     */
    private void simulateMatch() {
        try {
            String strRed1 = (String) this.cmbRed1.getSelectedItem();
            String strRed2 = (String) this.cmbRed2.getSelectedItem();
            String strRed3 = (String) this.cmbRed3.getSelectedItem();
            String strBlue1 = (String) this.cmbBlue1.getSelectedItem();
            String strBlue2 = (String) this.cmbBlue2.getSelectedItem();
            String strBlue3 = (String) this.cmbBlue3.getSelectedItem();

            if (strRed1 == null || strRed2 == null || strRed3 == null ||
                    strBlue1 == null || strBlue2 == null || strBlue3 == null) {
                this.txtMatchResult.setText("Error: Add at least 6 robots before simulating.");
                return;
            }

            ScoutedRobot red1 = this.tournament.findRobot(Short.parseShort(strRed1));
            ScoutedRobot red2 = this.tournament.findRobot(Short.parseShort(strRed2));
            ScoutedRobot red3 = this.tournament.findRobot(Short.parseShort(strRed3));
            ScoutedRobot blue1 = this.tournament.findRobot(Short.parseShort(strBlue1));
            ScoutedRobot blue2 = this.tournament.findRobot(Short.parseShort(strBlue2));
            ScoutedRobot blue3 = this.tournament.findRobot(Short.parseShort(strBlue3));

            if (red1 == null || red2 == null || red3 == null ||
                    blue1 == null || blue2 == null || blue3 == null) {
                this.txtMatchResult.setText("Error: One or more selected robots not found.");
                return;
            }

            Alliance redAlliance = new Alliance(red1, red2, red3);
            Alliance blueAlliance = new Alliance(blue1, blue2, blue3);
            Match match = new Match(redAlliance, blueAlliance, (byte) 0);

            this.txtMatchResult.setText(match.getGameSummary());
        } catch (NumberFormatException e) {
            this.txtMatchResult.setText("Error: Invalid team number in selection.");
        }
    }

    /**
     * Sorts robots by their base score (sortByScore), then computes a weighted
     * score
     * using the slider values (fuel, climb, defence) and populates the pick list
     * JTable.
     */
    private void generatePicklist() {
        this.tournament.sortByScore();
        ArrayList<ScoutedRobot> robots = this.tournament.getRobots();

        int intFuelWeight = this.sldFuelWeight.getValue();
        int intClimbWeight = this.sldClimbWeight.getValue();
        int intDefenceWeight = this.sldDefenceWeight.getValue();

        this.picklistModel.setRowCount(0);

        for (int i = 0; i < robots.size(); i++) {
            ScoutedRobot robot = robots.get(i);

            int intFuelScore = robot.getAutoFuelCount() + robot.getTeleFuelCount() + robot.getEndFuelCount();
            int intClimbScore = robot.getClimbLevel() * 10;
            int intDefenceScore = robot.getDefenceTime();

            // apply slider weights to each component and sum
            int intWeightedScore = (intFuelScore * intFuelWeight)
                    + (intClimbScore * intClimbWeight)
                    + (intDefenceScore * intDefenceWeight);

            Object[] row = { i + 1, robot.getTeamNumber(), intWeightedScore, robot.getMatchesObserved() };
            this.picklistModel.addRow(row);
        }
    }

    /**
     * Clears and repopulates the dashboard JTable from the current tournament robot
     * list.
     */
    private void refreshDashboard() {
        this.dashboardModel.setRowCount(0);
        ArrayList<ScoutedRobot> robots = this.tournament.getRobots();

        for (ScoutedRobot robot : robots) {
            Object[] row = {
                    robot.getTeamNumber(),
                    robot.getAutoFuelCount(),
                    robot.getTeleFuelCount(),
                    robot.getEndFuelCount(),
                    robot.getIndividualScore(),
                    robot.getMatchesObserved()
            };
            this.dashboardModel.addRow(row);
        }
    }

    /**
     * Repopulates all 6 Match Predictor combo boxes with the current scouted team
     * numbers.
     * Called automatically when the user switches to the Match Predictor tab.
     */
    private void refreshComboBoxes() {
        ArrayList<ScoutedRobot> robots = this.tournament.getRobots();

        this.cmbRed1.removeAllItems();
        this.cmbRed2.removeAllItems();
        this.cmbRed3.removeAllItems();
        this.cmbBlue1.removeAllItems();
        this.cmbBlue2.removeAllItems();
        this.cmbBlue3.removeAllItems();

        for (ScoutedRobot robot : robots) {
            String strTeamNum = String.valueOf(robot.getTeamNumber());
            this.cmbRed1.addItem(strTeamNum);
            this.cmbRed2.addItem(strTeamNum);
            this.cmbRed3.addItem(strTeamNum);
            this.cmbBlue1.addItem(strTeamNum);
            this.cmbBlue2.addItem(strTeamNum);
            this.cmbBlue3.addItem(strTeamNum);
        }
    }

    /**
     * Opens a JFileChooser and calls tournament.saveToFile() on the chosen path.
     */
    private void saveFile() {
        JFileChooser fileChooser = new JFileChooser();
        int intResult = fileChooser.showSaveDialog(this);

        if (intResult == JFileChooser.APPROVE_OPTION) {
            String strFileName = fileChooser.getSelectedFile().getAbsolutePath();
            this.tournament.saveToFile(strFileName);
            JOptionPane.showMessageDialog(this, "File saved successfully!");
        }
    }

    /**
     * Opens a JFileChooser and calls tournament.loadFromFile() on the chosen path,
     * then refreshes the dashboard to reflect the loaded data.
     */
    private void loadFile() {
        JFileChooser fileChooser = new JFileChooser();
        int intResult = fileChooser.showOpenDialog(this);

        if (intResult == JFileChooser.APPROVE_OPTION) {
            String strFileName = fileChooser.getSelectedFile().getAbsolutePath();
            this.tournament.loadFromFile(strFileName);
            this.refreshDashboard();
            JOptionPane.showMessageDialog(this, "File loaded successfully!");
        }
    }

    /**
     * Entry point. Creates and displays the ScoutingApp window.
     */
    public static void main(String[] args) {
        new ScoutingApp();
    }
}
