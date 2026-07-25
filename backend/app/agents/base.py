from abc import ABC, abstractmethod
from typing import Any, Dict

class BaseAgent(ABC):
    """
    Abstract Base Class for all Autonomous Agents in the LawGPT AI OS.
    Declares the mandatory lifecycle hook methods.
    """

    @abstractmethod
    async def initialize(self) -> None:
        """
        Perform agent initialization logic (e.g., loading models, prompts,
        or establishing external resources).
        """
        pass

    @abstractmethod
    async def execute(self, task_input: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute the agent's core cognitive task logic with the given inputs.
        
        Args:
            task_input (Dict[str, Any]): Structured input payload for the agent task.

        Returns:
            Dict[str, Any]: Execution output result.
        """
        pass

    @abstractmethod
    async def shutdown(self) -> None:
        """
        Clean up resources, close network clients, and serialize cache/state.
        """
        pass

    @abstractmethod
    async def health(self) -> Dict[str, Any]:
        """
        Return the health status and diagnostics of the agent.

        Returns:
            Dict[str, Any]: Health diagnostic metrics (status, latency, etc).
        """
        pass
